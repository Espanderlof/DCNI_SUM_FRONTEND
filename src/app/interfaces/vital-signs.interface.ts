import { Patient } from "./patient.interface";

export interface VitalSigns {
    id?: number;
    patient: Patient;
    heartRate: number;
    bloodPressureSystolic: number;
    bloodPressureDiastolic: number;
    bodyTemperature: number;
    oxygenSaturation: number;
    timestamp: string;
}