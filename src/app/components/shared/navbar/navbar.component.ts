// navbar.component.ts
import { Component, OnInit, OnDestroy, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AzureAuthService } from '../../../services/azure-auth.service';
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
  activeAlertsCount = 0;
  private readonly platformId = inject(PLATFORM_ID);
  private authSubscription?: Subscription;
  private activeAlertsSubscription?: Subscription;
  userInfo: any = null;

  constructor(
    private azureAuthService: AzureAuthService,
    private authStateService: AuthStateService,
    private alertsStateService: AlertsStateService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Escuchar cambios en el estado de autenticación
      this.authSubscription = this.authStateService.isAuthenticated$.subscribe(
        isAuthenticated => {
          this.isLoggedIn = isAuthenticated;
          
          if (isAuthenticated) {
            // Obtener información básica de la cuenta activa de MSAL
            const account = this.azureAuthService.getActiveAccount();
            if (account) {
              this.userInfo = {
                name: account.name,
                username: account.username,
              };
            }

            // Suscribirse al conteo de alertas
            this.activeAlertsSubscription = this.alertsStateService.activeAlertsCount$
              .subscribe(count => {
                this.activeAlertsCount = count;
              });
            
            // Forzar la carga inicial de alertas
            this.alertsStateService.refreshActiveAlertsCount();
          } else {
            this.userInfo = null;
          }
        }
      );

      // Verificar estado inicial
      this.checkLoginStatus();
    }
  }

  private checkLoginStatus(): void {
    if (this.azureAuthService.isLoggedIn()) {
      this.authStateService.updateAuthState(true);
    }
  }

  login(): void {
    this.router.navigate(['/login']);
  }

  logout(): void {
    this.azureAuthService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (error: Error) => {
        console.error('Error al cerrar sesión:', error);
      }
    });
  }

  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe();
    this.activeAlertsSubscription?.unsubscribe();
  }
}