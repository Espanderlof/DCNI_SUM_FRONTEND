// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login.component';
import { AlertsComponent } from './components/alerts/alerts.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/alerts', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { 
    path: 'alerts', 
    component: AlertsComponent,
    canActivate: [authGuard]
  }
];