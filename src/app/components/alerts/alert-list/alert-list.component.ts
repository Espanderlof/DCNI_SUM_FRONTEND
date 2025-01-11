import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertService } from '../../../services/alert.service';
import { AlertsStateService } from '../../../services/alerts-state.service';
import { PatientService } from '../../../services/patient.service';
import { Alert } from '../../../interfaces/alert.interface';
import { Patient } from '../../../interfaces/patient.interface';
import { AlertTypes } from '../../../types/alert-types';

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alert-list.component.html',
  styleUrls: ['./alert-list.component.css']
})
export class AlertListComponent implements OnInit {
  activeAlerts: Alert[] = [];
  patientMap = new Map<number, Patient>();
  loading = false;
  error = '';

  constructor(
    private alertService: AlertService,
    private alertsStateService: AlertsStateService,
    private patientService: PatientService
  ) { }

  ngOnInit(): void {
    this.loadActiveAlerts();
  }

  async loadActiveAlerts(): Promise<void> {
    try {
      this.loading = true;
      this.error = '';

      // Obtener alertas activas y ordenarlas por fecha descendente
      const alerts = await this.alertService.getActiveAlerts().toPromise();
      this.activeAlerts = (alerts || [])
        .filter(alert => alert.isActive)
        .sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

      // Cargar información de pacientes
      const patientIds = new Set(this.activeAlerts.map(alert => alert.patient.id!));
      for (const patientId of patientIds) {
        const patient = await this.patientService.getPatient(patientId).toPromise();
        if (patient) {
          this.patientMap.set(patientId, patient);
        }
      }
    } catch (err) {
      console.error('Error loading active alerts:', err);
      this.error = 'Error al cargar las alertas activas';
    } finally {
      this.loading = false;
    }
  }

  getTypeIcon(type: keyof typeof AlertTypes): string {
    const icons: Record<keyof typeof AlertTypes, string> = {
      [AlertTypes.ABNORMAL_HEART_RATE]: 'bi-heart-pulse',
      [AlertTypes.ABNORMAL_BLOOD_PRESSURE]: 'bi-activity',
      [AlertTypes.ABNORMAL_TEMPERATURE]: 'bi-thermometer-half',
      [AlertTypes.LOW_OXYGEN_SATURATION]: 'bi-lungs'
    };
    return icons[type] || 'bi-exclamation-circle';
  }

  getTypeLabel(type: keyof typeof AlertTypes): string {
    const types: Record<keyof typeof AlertTypes, string> = {
      [AlertTypes.ABNORMAL_HEART_RATE]: 'Frecuencia Cardíaca Alta',
      [AlertTypes.ABNORMAL_BLOOD_PRESSURE]: 'Presión Arterial Anormal',
      [AlertTypes.ABNORMAL_TEMPERATURE]: 'Temperatura Elevada',
      [AlertTypes.LOW_OXYGEN_SATURATION]: 'Saturación de Oxígeno Baja'
    };
    return types[type] || type;
  }

  getAlertClass(type: keyof typeof AlertTypes): string {
    const classes: Record<keyof typeof AlertTypes, string> = {
      [AlertTypes.ABNORMAL_HEART_RATE]: 'alert-danger',
      [AlertTypes.ABNORMAL_BLOOD_PRESSURE]: 'alert-warning',
      [AlertTypes.ABNORMAL_TEMPERATURE]: 'alert-warning',
      [AlertTypes.LOW_OXYGEN_SATURATION]: 'alert-info'
    };
    return classes[type] || 'alert-secondary';
  }

  getAlertButtonClass(type: keyof typeof AlertTypes): string {
    const classes: Record<keyof typeof AlertTypes, string> = {
      [AlertTypes.ABNORMAL_HEART_RATE]: 'btn-outline-danger',
      [AlertTypes.ABNORMAL_BLOOD_PRESSURE]: 'btn-outline-warning',
      [AlertTypes.ABNORMAL_TEMPERATURE]: 'btn-outline-warning',
      [AlertTypes.LOW_OXYGEN_SATURATION]: 'btn-outline-info'
    };
    return classes[type] || 'btn-outline-secondary';
  }

  getTimeDifference(timestamp: string): string {
    const alertDate = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - alertDate.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 60) {
      return `Hace ${diffMinutes} minutos`;
    } else if (diffMinutes < 1440) {
      const diffHours = Math.floor(diffMinutes / 60);
      return `Hace ${diffHours} horas`;
    } else {
      const diffDays = Math.floor(diffMinutes / 1440);
      return `Hace ${diffDays} días`;
    }
  }

  async attendAlert(alert: Alert): Promise<void> {
    try {
      await this.alertService.resolveAlert(alert.id!).toPromise();
      // Actualizar el conteo de alertas activas después de resolver
      this.alertsStateService.refreshActiveAlertsCount();
      await this.loadActiveAlerts();
    } catch (err) {
      console.error('Error attending alert:', err);
      this.error = 'Error al atender la alerta';
    }
}
}