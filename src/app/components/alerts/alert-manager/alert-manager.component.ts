import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AlertService } from '../../../services/alert.service';
import { PatientService } from '../../../services/patient.service';
import { Alert } from '../../../interfaces/alert.interface';
import { Patient } from '../../../interfaces/patient.interface';
import { AlertTypes } from '../../../types/alert-types';

@Component({
    selector: 'app-alert-manager',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    templateUrl: './alert-manager.component.html',
    styleUrls: ['./alert-manager.component.css']
})
export class AlertManagerComponent implements OnInit {
    alerts: Alert[] = [];
    patientMap = new Map<number, Patient>();
    loading = false;
    error = '';
    statusFilter: 'ALL' | 'ACTIVE' | 'RESOLVED' = 'ALL';
    searchTerm = '';
    typeFilter: string = 'ALL';

    constructor(
        private alertService: AlertService,
        private patientService: PatientService
    ) { }

    ngOnInit(): void {
        this.loadAlerts();
    }

    async loadAlerts(): Promise<void> {
        try {
            this.loading = true;
            this.error = '';

            const alerts = await this.alertService.getAllAlerts().toPromise();
            this.alerts = (alerts || []).sort((a, b) => 
                new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            );

            // Cargar información de pacientes
            const patientIds = new Set(this.alerts.map(alert => alert.patient.id!));
            for (const patientId of patientIds) {
                const patient = await this.patientService.getPatient(patientId).toPromise();
                if (patient) {
                    this.patientMap.set(patientId, patient);
                }
            }
        } catch (err) {
            console.error('Error loading alerts:', err);
            this.error = 'Error al cargar las alertas';
        } finally {
            this.loading = false;
        }
    }

    getPatientName(patientId: number | undefined): string {
        if (patientId === undefined) {
            return 'Paciente no encontrado';
        }
        const patient = this.patientMap.get(patientId);
        return patient ? patient.name : 'Paciente no encontrado';
    }

    async resolveAlert(alert: Alert): Promise<void> {
        try {
            await this.alertService.resolveAlert(alert.id!).toPromise();
            await this.loadAlerts();
        } catch (err) {
            console.error('Error resolving alert:', err);
            this.error = 'Error al resolver la alerta';
        }
    }

    async deleteAlert(alert: Alert): Promise<void> {
        if (confirm('¿Está seguro de eliminar esta alerta?')) {
            try {
                await this.alertService.deleteAlert(alert.id!).toPromise();
                await this.loadAlerts();
            } catch (err) {
                console.error('Error deleting alert:', err);
                this.error = 'Error al eliminar la alerta';
            }
        }
    }

    getTypeLabel(type: keyof typeof AlertTypes): string {
        const types: Record<keyof typeof AlertTypes, string> = {
            [AlertTypes.ABNORMAL_HEART_RATE]: 'Frecuencia Cardíaca',
            [AlertTypes.ABNORMAL_BLOOD_PRESSURE]: 'Presión Arterial',
            [AlertTypes.ABNORMAL_TEMPERATURE]: 'Temperatura',
            [AlertTypes.LOW_OXYGEN_SATURATION]: 'Saturación de Oxígeno'
        };
        return types[type] || type;
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

    getFilteredAlerts(): Alert[] {
        return this.alerts.filter(alert => {
            const matchesStatus = this.statusFilter === 'ALL' || (alert.isActive === (this.statusFilter === 'ACTIVE'));
            const matchesType = this.typeFilter === 'ALL' || alert.alertType === this.typeFilter;
            const matchesSearch = this.searchTerm === '' ||
                this.getPatientName(alert.patient?.id).toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                alert.description.toLowerCase().includes(this.searchTerm.toLowerCase());

            return matchesStatus && matchesType && matchesSearch;
        });
    }
}