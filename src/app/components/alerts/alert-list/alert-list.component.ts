import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertService } from '../../../services/alert.service';
import { AlertsStateService } from '../../../services/alerts-state.service';
import { PatientService } from '../../../services/patient.service';
import { BlobService } from '../../../services/blob.service';
import { Alert } from '../../../interfaces/alert.interface';
import { Patient } from '../../../interfaces/patient.interface';
import { BlobFile } from '../../../interfaces/blob-file.interface';
import { AlertTypes } from '../../../types/alert-types';
import { firstValueFrom } from 'rxjs';

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
  files: BlobFile[] = [];
  loadingFiles = false;
  fileError = '';

  constructor(
    private alertService: AlertService,
    private alertsStateService: AlertsStateService,
    private patientService: PatientService,
    private blobService: BlobService
  ) { }

  ngOnInit(): void {
    this.loadActiveAlerts();
    this.loadFiles();
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

  async loadFiles(): Promise<void> {
    try {
      this.loadingFiles = true;
      this.fileError = '';
      const files = await firstValueFrom(this.blobService.getFiles());
      // Ordenar por fecha de modificación descendente
      this.files = files.sort((a, b) =>
        new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
      );
    } catch (err) {
      console.error('Error loading files:', err);
      this.fileError = 'Error al cargar los archivos';
    } finally {
      this.loadingFiles = false;
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  async downloadFile(file: BlobFile): Promise<void> {
    try {
      const blob = await firstValueFrom(this.blobService.downloadFile(file.name));
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading file:', err);
      this.fileError = 'Error al descargar el archivo';
    }
  }

  async deleteFile(file: BlobFile): Promise<void> {
    if (confirm(`¿Está seguro de eliminar el archivo ${file.name}?`)) {
      try {
        await firstValueFrom(this.blobService.deleteFile(file.name));
        await this.loadFiles();
      } catch (err) {
        console.error('Error deleting file:', err);
        this.fileError = 'Error al eliminar el archivo';
      }
    }
  }
}