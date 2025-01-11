//dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AlertService } from '../../services/alert.service';
import { PatientService } from '../../services/patient.service';
import { Alert } from '../../interfaces/alert.interface';
import { Patient } from '../../interfaces/patient.interface';
import { AlertTypes } from '../../types/alert-types';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
    alerts: Alert[] = [];
    patients: Patient[] = [];
    loading = false;
    error = '';

    // Estadísticas
    totalAlerts = 0;
    activeAlerts = 0;
    criticalAlerts = 0;
    totalPatients = 0;
    patientsWithAlerts = 0;

    constructor(
        private alertService: AlertService,
        private patientService: PatientService
    ) { }

    ngOnInit(): void {
        this.loadDashboardData();
    }

    async loadDashboardData(): Promise<void> {
        try {
            this.loading = true;

            // Cargar alertas y pacientes en paralelo
            const [alerts, patients] = await Promise.all([
                this.alertService.getActiveAlerts().toPromise(),
                this.patientService.getPatients().toPromise()
            ]);

            this.alerts = alerts || [];
            this.patients = patients || [];

            // Ordenar alertas por fecha, más recientes primero
            this.alerts.sort((a, b) =>
                new Date(b.timestamp || '').getTime() - new Date(a.timestamp || '').getTime()
            );

            // Calcular estadísticas
            this.calculateStatistics();

            this.loading = false;
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.error = 'Error al cargar los datos del dashboard';
            this.loading = false;
        }
    }

    private calculateStatistics(): void {
        this.totalAlerts = this.alerts.length;
        this.activeAlerts = this.alerts.filter(a => a.isActive === true).length;
        this.criticalAlerts = this.alerts.filter(a =>
            a.isActive === true &&
            (a.alertType === 'ABNORMAL_HEART_RATE' || a.alertType === 'LOW_OXYGEN_SATURATION')
        ).length;

        this.totalPatients = this.patients.length;
        const patientIdsWithAlerts = new Set(this.alerts.map(a => a.id));
        this.patientsWithAlerts = patientIdsWithAlerts.size;
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
}