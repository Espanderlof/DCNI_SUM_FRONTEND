// src/app/components/shared/navbar/navbar.component.ts
import { Component, OnInit, OnDestroy, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AzureAuthService, UserProfile } from '../../../services/azure-auth.service';
import { AuthStateService } from '../../../services/auth-state.service';
import { AlertsStateService } from '../../../services/alerts-state.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  userProfile: UserProfile | null = null;
  activeAlertsCount = 0;
  private readonly platformId = inject(PLATFORM_ID);
  private profileSubscription?: Subscription;
  private activeAlertsSubscription?: Subscription;

  constructor(
    private azureAuthService: AzureAuthService,
    private authStateService: AuthStateService,
    private alertsStateService: AlertsStateService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Escuchar cambios en el perfil
      this.profileSubscription = this.authStateService.userProfile$.subscribe(profile => {
        this.userProfile = profile;
        this.isLoggedIn = !!profile;
  
        // Suscribirse al conteo de alertas cuando el usuario está logueado
        if (this.isLoggedIn) {
          // Inicializar la suscripción a alertas o refrescar
          this.activeAlertsSubscription = this.alertsStateService.activeAlertsCount$
            .subscribe(count => {
              this.activeAlertsCount = count;
            });
          
          // Forzar la carga inicial de alertas
          this.alertsStateService.refreshActiveAlertsCount();
        }
      });
  
      // Verificar estado inicial
      this.checkLoginStatus();
    }
  }

  private checkLoginStatus(): void {
    if (this.azureAuthService.isLoggedInWithAzure()) {
      const profile = this.azureAuthService.getProfile();
      if (profile) {
        this.authStateService.updateUserProfile(profile);
      }
    }
  }

  login(): void {
    this.router.navigate(['/login']);
  }

  logout(): void {
    // Primero limpiamos localStorage manualmente
    localStorage.removeItem('azure_user_profile');
    
    this.azureAuthService.logout().subscribe({
      next: () => {
        // Forzar una limpieza adicional después del logout
        localStorage.removeItem('azure_user_profile');
        this.authStateService.updateUserProfile(null);
        this.router.navigate(['/login']);
      },
      error: (error: Error) => {
        console.error('Error al cerrar sesión:', error);
      }
    });
  }

  ngOnDestroy(): void {
    this.profileSubscription?.unsubscribe();
    this.activeAlertsSubscription?.unsubscribe();
  }
}