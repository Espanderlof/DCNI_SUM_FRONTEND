import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Alert } from '../interfaces/alert.interface';

@Injectable({
    providedIn: 'root'
})
export class AlertService {
    private baseUrl = 'http://localhost:8081/api/alerts';

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
}