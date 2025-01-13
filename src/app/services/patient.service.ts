import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Patient } from '../interfaces/patient.interface';
import { environment } from '../../environment/environment';

@Injectable({
    providedIn: 'root'
})
export class PatientService {
    private baseUrl = `${environment.apis.alertas.baseUrl}/patients`;

    constructor(private http: HttpClient) { }

    getPatients(): Observable<Patient[]> {
        return this.http.get<Patient[]>(this.baseUrl);
    }

    getPatient(id: number): Observable<Patient> {
        return this.http.get<Patient>(`${this.baseUrl}/${id}`);
    }

    createPatient(patient: Patient): Observable<Patient> {
        return this.http.post<Patient>(this.baseUrl, patient);
    }

    updatePatient(id: number, patient: Patient): Observable<Patient> {
        return this.http.put<Patient>(`${this.baseUrl}/${id}`, patient);
    }

    deletePatient(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${id}`);
    }
}