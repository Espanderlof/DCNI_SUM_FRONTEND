import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AzureAuthService } from './azure-auth.service';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const azureAuthService = inject(AzureAuthService);
  const token = azureAuthService.getToken();

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req);
};