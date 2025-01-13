// src/app/services/azure-auth.service.ts
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MsalService } from '@azure/msal-angular';
import { AuthenticationResult } from '@azure/msal-browser';
import { Observable, from, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../environment/environment';
import { AuthStateService } from './auth-state.service';

export interface UserProfile {
  id: string;
  nombre: string;
  apellidos: string;
  email: string;
  nombreParaMostrar: string;
  accessToken: string;
  telefono: string;
  direccion: string;
  tfp: string;
  version: string;
}

@Injectable({
  providedIn: 'root'
})
export class AzureAuthService {
  private readonly TOKEN_KEY = 'msal_id_token';
  private readonly PROFILE_KEY = 'azure_user_profile';
  private readonly platformId = inject(PLATFORM_ID);

  constructor(
    private msalService: MsalService,
    private http: HttpClient,
    private authStateService: AuthStateService
  ) {}

  saveToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.TOKEN_KEY, token);
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
    }
  }

  isLoggedInWithAzure(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return this.msalService.instance.getAllAccounts().length > 0;
    }
    return false;
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

  getAzureProfile(): Observable<any> {
    if (!isPlatformBrowser(this.platformId)) {
      return of(null);
    }

    const token = this.getToken();
    if (!token) {
      throw new Error('No hay token de acceso disponible');
    }

    return this.http.get(environment.apis.alertas.endpoints.perfilAzure, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  saveProfile(profile: UserProfile): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.PROFILE_KEY, JSON.stringify(profile));
      this.authStateService.updateUserProfile(profile);
    }
  }

  getProfile(): UserProfile | null {
    if (isPlatformBrowser(this.platformId)) {
      const profile = localStorage.getItem(this.PROFILE_KEY);
      const parsedProfile = profile ? JSON.parse(profile) : null;
      if (parsedProfile) {
        this.authStateService.updateUserProfile(parsedProfile);
      }
      return parsedProfile;
    }
    return null;
  }

  removeProfile(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.PROFILE_KEY);
    }
  }

  clearAllStorageData(): void {
    if (isPlatformBrowser(this.platformId)) {
      console.log('Limpiando todos los datos de almacenamiento...');
      
      // Limpiar datos específicos de nuestra aplicación
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.PROFILE_KEY);
      localStorage.removeItem('azure_user_profile'); // Asegurarnos de usar la key exacta
      
      // Limpiar datos de MSAL
      localStorage.removeItem('msal.token.keys');
      localStorage.removeItem('msal.account.keys');
      localStorage.removeItem('msal.interaction.status');
      localStorage.removeItem('msal.browser.session.id');
      localStorage.removeItem('msal.idtoken');
      localStorage.removeItem('msal.cache.keys');
      
      // Limpiar cualquier otro dato de MSAL que pueda existir
      const keysToRemove = [];
      for(let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('msal.') || key?.includes('azure')) {
          keysToRemove.push(key);
        }
      }
      
      // Eliminar las keys encontradas
      keysToRemove.forEach(key => {
        console.log('Eliminando:', key);
        localStorage.removeItem(key);
      });

      // Actualizar el estado
      this.authStateService.updateUserProfile(null);
      
      console.log('Limpieza completada');
    }
  }

  logout(): Observable<boolean> {
    if (isPlatformBrowser(this.platformId)) {
      return from(this.msalService.logoutRedirect()).pipe(
        tap(() => {
          console.log('Iniciando proceso de logout...');
          
          // Limpiar todo el almacenamiento
          this.clearAllStorageData();
          
          // Limpiar caché de MSAL
          this.msalService.instance.clearCache();
          
          console.log('Proceso de logout completado');
        }),
        map(() => true)
      );
    }
    return of(false);
  }
}