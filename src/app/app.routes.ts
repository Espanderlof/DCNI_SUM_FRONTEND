// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AlertListComponent } from './components/alerts/alert-list/alert-list.component';
import { AlertManagerComponent } from './components/alerts/alert-manager/alert-manager.component';
import { PatientListComponent } from './components/patients/patient-list/patient-list.component';
import { PatientFormComponent } from './components/patients/patient-form/patient-form.component';
import { VitalSignsListComponent } from './components/vital-signs/vital-signs-list/vital-signs-list.component';
import { PatientDetailsComponent } from './components/patients/patient-details/patient-details.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { 
    path: '', 
    component: DashboardComponent,
    canActivate: [authGuard] 
  },
  { path: 'login', component: LoginComponent },
  { 
    path: 'alerts', 
    component: AlertListComponent,
    canActivate: [authGuard]
  },
  {
    path: 'alert-manager',
    component: AlertManagerComponent,
    canActivate: [authGuard]
  },
  {
    path: 'patients',
    component: PatientListComponent,
    canActivate: [authGuard]
  },
  {
    path: 'patients/new',
    component: PatientFormComponent,
    canActivate: [authGuard]
  },
  {
    path: 'patients/edit/:id',
    component: PatientFormComponent,
    canActivate: [authGuard]
  },
  {
    path: 'patients/:id/vital-signs',
    component: VitalSignsListComponent,
    canActivate: [authGuard]
  },
  {
    path: 'patients/details/:id',
    component: PatientDetailsComponent,
    canActivate: [authGuard]
  },
];