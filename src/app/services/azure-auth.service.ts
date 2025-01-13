// src/app/services/azure-auth.service.ts
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MsalService } from '@azure/msal-angular';
import { AuthenticationResult } from '@azure/msal-browser';
import { Observable, from, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { AuthStateService } from './auth-state.service';

@Injectable({
  providedIn: 'root'
})
export class AzureAuthService {
  private readonly TOKEN_KEY = 'msal_id_token';
  private readonly platformId = inject(PLATFORM_ID);

  constructor(
    private msalService: MsalService,
    private authStateService: AuthStateService
  ) {}

  saveToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.TOKEN_KEY, token);
      // Cuando guardamos el token, actualizamos el estado de autenticación
      this.authStateService.updateAuthState(true);
    }
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  removeToken(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.TOKEN_KEY);
      this.authStateService.updateAuthState(false);
    }
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getActiveAccount() {
    if (isPlatformBrowser(this.platformId)) {
      return this.msalService.instance.getActiveAccount();
    }
    return null;
  }

  loginWithRedirect(): Observable<void> {
    if (isPlatformBrowser(this.platformId)) {
      return from(this.msalService.loginRedirect());
    }
    return of(void 0);
  }

  handleRedirectPromise(): Observable<AuthenticationResult | null> {
    if (isPlatformBrowser(this.platformId)) {
      return from(this.msalService.handleRedirectObservable());
    }
    return of(null);
  }

  clearAllStorageData(): void {
    if (isPlatformBrowser(this.platformId)) {
      console.log('Limpiando datos de almacenamiento...');
      
      // Limpiar token
      localStorage.removeItem(this.TOKEN_KEY);
      
      // Limpiar datos de MSAL
      localStorage.removeItem('msal.token.keys');
      localStorage.removeItem('msal.account.keys');
      localStorage.removeItem('msal.interaction.status');
      localStorage.removeItem('msal.browser.session.id');
      localStorage.removeItem('msal.idtoken');
      localStorage.removeItem('msal.cache.keys');
      
      // Limpiar cualquier otro dato de MSAL
      const keysToRemove = [];
      for(let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('msal.')) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => {
        console.log('Eliminando:', key);
        localStorage.removeItem(key);
      });

      // Actualizar el estado
      this.authStateService.updateAuthState(false);
      
      console.log('Limpieza completada');
    }
  }

  logout(): Observable<boolean> {
    if (isPlatformBrowser(this.platformId)) {
      return from(this.msalService.logoutRedirect()).pipe(
        tap(() => {
          console.log('Iniciando proceso de logout...');
          this.clearAllStorageData();
          this.msalService.instance.clearCache();
          console.log('Proceso de logout completado');
        }),
        map(() => true)
      );
    }
    return of(false);
  }
}