import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { PatientService } from '../../../services/patient.service';
import { VitalSignsService } from '../../../services/vital-signs.service';
import { AlertService } from '../../../services/alert.service';
import { Patient } from '../../../interfaces/patient.interface';
import { VitalSigns } from '../../../interfaces/vital-signs.interface';
import { Alert } from '../../../interfaces/alert.interface';
import { AlertTypes } from '../../../types/alert-types';
import { SeverityTypes } from '../../../types/severity-types';

@Component({
    selector: 'app-patient-details',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './patient-details.component.html',
    styleUrls: ['./patient-details.component.scss']
})
export class PatientDetailsComponent implements OnInit {
    patient: Patient | null = null;
    vitalSigns: VitalSigns[] = [];
    alerts: Alert[] = [];
    loading = false;
    error = '';

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private patientService: PatientService,
        private vitalSignsService: VitalSignsService,
        private alertService: AlertService
    ) { }

    ngOnInit(): void {
        const patientId = Number(this.route.snapshot.paramMap.get('id'));
        if (patientId) {
            this.loadPatientData(patientId);
        }
    }

    async loadPatientData(patientId: number): Promise<void> {
        try {
            this.loading = true;
    
            const [patient, vitalSigns, alerts] = await Promise.all([
                this.patientService.getPatient(patientId).toPromise(),
                this.vitalSignsService.getVitalSigns(patientId).toPromise(),
                this.alertService.getPatientAlerts(patientId).toPromise()
            ]);
    
            console.log('Alertas recibidas:', alerts); // Verificar las alertas que llegan
            
            this.patient = patient || null;
            this.vitalSigns = vitalSigns || [];
            this.alerts = alerts || [];
    
            // Asegurarnos que las alertas tengan el formato correcto
            this.alerts = this.alerts.map(alert => {
                console.log('Tipo de alerta:', alert.alertType); // Verificar el tipo de cada alerta
                console.log('Estado de alerta:', alert.isActive); // Verificar el estado
                return {
                    ...alert,
                    type: this.determineAlertType(alert.description),
                    status: 'ACTIVE' // Por defecto las ponemos como activas
                };
            });
    
        } catch (error) {
            console.error('Error loading patient data:', error);
            this.error = 'Error al cargar los datos del paciente';
        } finally {
            this.loading = false;
        }
    }

    private determineAlertType(description: string): keyof typeof AlertTypes {
        const lowerDesc = description.toLowerCase();
        if (lowerDesc.includes('presión') || lowerDesc.includes('presion')) {
            return AlertTypes.ABNORMAL_BLOOD_PRESSURE;
        } else if (lowerDesc.includes('temperatura')) {
            return AlertTypes.ABNORMAL_TEMPERATURE;
        } else if (lowerDesc.includes('oxígeno') || lowerDesc.includes('oxigeno')) {
            return AlertTypes.LOW_OXYGEN_SATURATION;
        } else {
            return AlertTypes.ABNORMAL_HEART_RATE;
        }
    }

    // Función para verificar si los signos vitales están fuera de rango
    isOutOfRange(value: number, type: string): boolean {
        const ranges = {
            heartRate: { min: 60, max: 100 },
            bloodPressureSystolic: { min: 90, max: 140 },
            bloodPressureDiastolic: { min: 60, max: 90 },
            bodyTemperature: { min: 36.5, max: 37.5 },
            oxygenSaturation: { min: 95, max: 100 }
        };
        return value < ranges[type as keyof typeof ranges].min || value > ranges[type as keyof typeof ranges].max;
    }

    editPatient(): void {
        this.router.navigate(['/patients/edit', this.patient?.id]);
    }

    viewVitalSigns(): void {
        this.router.navigate(['/patients', this.patient?.id, 'vital-signs']);
    }

    getAlertTypeLabel(alertType: keyof typeof AlertTypes): string {
        const types: Record<keyof typeof AlertTypes, string> = {
            [AlertTypes.ABNORMAL_BLOOD_PRESSURE]: 'Presión Arterial',
            [AlertTypes.ABNORMAL_TEMPERATURE]: 'Temperatura',
            [AlertTypes.LOW_OXYGEN_SATURATION]: 'Saturación de Oxígeno',
            [AlertTypes.ABNORMAL_HEART_RATE]: 'Frecuencia Cardíaca'
        };
        return types[alertType] || 'Alerta';
    }

    getAlertIcon(alertType: keyof typeof AlertTypes): string {
        const icons: Record<keyof typeof AlertTypes, string> = {
            [AlertTypes.ABNORMAL_BLOOD_PRESSURE]: 'bi-activity',
            [AlertTypes.ABNORMAL_TEMPERATURE]: 'bi-thermometer-half',
            [AlertTypes.LOW_OXYGEN_SATURATION]: 'bi-lungs',
            [AlertTypes.ABNORMAL_HEART_RATE]: 'bi-heart-pulse-fill'
        };
        return icons[alertType] || 'bi-exclamation-circle';
    }

    getAlertColor(alertType: keyof typeof AlertTypes): string {
        const colors: Record<keyof typeof AlertTypes, string> = {
            [AlertTypes.ABNORMAL_BLOOD_PRESSURE]: 'warning',
            [AlertTypes.ABNORMAL_TEMPERATURE]: 'primary',
            [AlertTypes.LOW_OXYGEN_SATURATION]: 'info',
            [AlertTypes.ABNORMAL_HEART_RATE]: 'danger'
        };
        return colors[alertType] || 'secondary';
    }

    getSeverityBadgeClass(severity: string): string {
        const classes: Record<typeof SeverityTypes[keyof typeof SeverityTypes], string> = {
            [SeverityTypes.HIGH]: 'bg-danger',
            [SeverityTypes.MEDIUM]: 'bg-warning',
            [SeverityTypes.LOW]: 'bg-info'
        };
        return classes[severity as keyof typeof SeverityTypes] || 'bg-secondary';
    }

    getSeverityLabel(severity: string): string {
        const labels: Record<typeof SeverityTypes[keyof typeof SeverityTypes], string> = {
            [SeverityTypes.HIGH]: 'Alta',
            [SeverityTypes.MEDIUM]: 'Media',
            [SeverityTypes.LOW]: 'Baja'
        };
        return labels[severity as keyof typeof SeverityTypes] || severity;
    }
}