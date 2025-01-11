import { Patient } from "./patient.interface";
import { AlertTypes } from "../types/alert-types";

export interface Alert {
    id?: number;
    patient: Patient;
    alertType: keyof typeof AlertTypes; 
    description: string;
    severity: string;
    timestamp: string;
    isActive: boolean;
}