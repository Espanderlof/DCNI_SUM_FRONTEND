import { Component, OnInit, OnDestroy, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { AzureAuthService } from '../../../services/azure-auth.service';
import { MsalService, MsalBroadcastService } from '@azure/msal-angular';
import { AuthenticationResult, EventMessage, EventType } from '@azure/msal-browser';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  errorMessage = '';
  private readonly _destroying$ = new Subject<void>();
  private readonly platformId = inject(PLATFORM_ID);

  constructor(
    private msalService: MsalService,
    private azureAuthService: AzureAuthService,
    private router: Router,
    private msalBroadcastService: MsalBroadcastService
  ) {}

  ngOnInit(): void {
    // Verificar si ya está logueado
    if (this.azureAuthService.isLoggedInWithAzure()) {
      this.router.navigate(['/']);
      return;
    }

    if (isPlatformBrowser(this.platformId)) {
      this.msalBroadcastService.msalSubject$
        .pipe(
          filter((msg: EventMessage) => msg.eventType === EventType.LOGIN_SUCCESS),
          takeUntil(this._destroying$)
        )
        .subscribe({
          next: (result: EventMessage) => {
            console.log('Login successful');
            const payload = result.payload as AuthenticationResult;
            if (payload.idToken) {
              console.log('Token received, saving...');
              this.azureAuthService.saveToken(payload.idToken);
              this.getAzureProfile();
            }
          },
          error: (error: Error) => {
            console.error('Error en evento de login:', error);
            this.errorMessage = 'Error al procesar el inicio de sesión';
          }
        });
    }
  }

  getAzureProfile(): void {
    this.azureAuthService.getAzureProfile().subscribe({
      next: (profile) => {
        console.log('Perfil de Azure obtenido:', profile);
        this.azureAuthService.saveProfile(profile);
        this.router.navigate(['/']);
      },
      error: (error: Error) => {
        console.error('Error al obtener perfil de Azure:', error);
        this.errorMessage = 'Error al obtener datos del perfil';
      }
    });
  }

  loginWithAzure(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.msalService.initialize().subscribe({
        next: () => {
          this.msalService.loginRedirect().subscribe({
            error: (error: Error) => {
              console.error('Error iniciando sesión con Azure:', error);
              this.errorMessage = 'Error al iniciar sesión con Azure';
            }
          });
        },
        error: (error: Error) => {
          console.error('Error inicializando MSAL:', error);
          this.errorMessage = 'Error al inicializar el servicio de autenticación';
        }
      });
    }
  }

  ngOnDestroy(): void {
    this._destroying$.next(undefined);
    this._destroying$.complete();
  }
}