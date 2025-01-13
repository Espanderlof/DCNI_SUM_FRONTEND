import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Alert } from '../interfaces/alert.interface';
import { environment } from '../../environment/environment';

@Injectable({
    providedIn: 'root'
})
export class AlertService {
    private baseUrl = `${environment.apis.alertas.baseUrl}/alerts`;

    constructor(private http: HttpClient) { }

    getActiveAlerts(): Observable<Alert[]> {
        return this.http.get<Alert[]>(`${this.baseUrl}/active`);
    }

    getPatientAlerts(patientId: number): Observable<Alert[]> {
        return this.http.get<Alert[]>(`${this.baseUrl}/patient/${patientId}`);
    }

    resolveAlert(alertId: number): Observable<Alert> {
        return this.http.put<Alert>(`${this.baseUrl}/${alertId}/resolve`, {});
    }

    deleteAlert(alertId: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${alertId}`);
    }

    getAllAlerts(): Observable<Alert[]> {
        return this.http.get<Alert[]>(`${this.baseUrl}/all`);
    }
}