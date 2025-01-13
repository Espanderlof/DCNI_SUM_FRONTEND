import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AzureAuthService } from '../services/azure-auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const azureAuthService = inject(AzureAuthService);
  const router = inject(Router);

  if (azureAuthService.isLoggedIn()) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};