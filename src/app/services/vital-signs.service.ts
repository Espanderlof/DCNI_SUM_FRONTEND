import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { VitalSigns } from '../interfaces/vital-signs.interface';
import { VitalSignsDTO } from '../interfaces/vital-signs-dto.interface';

@Injectable({
    providedIn: 'root'
})
export class VitalSignsService {
    private baseUrl = 'http://localhost:8081/api/vital-signs';

    constructor(private http: HttpClient) { }

    getVitalSigns(patientId: number): Observable<VitalSigns[]> {
        return this.http.get<VitalSigns[]>(`${this.baseUrl}/patient/${patientId}`);
    }

    createVitalSigns(vitalSigns: VitalSignsDTO): Observable<VitalSigns> {
        return this.http.post<VitalSigns>(this.baseUrl, vitalSigns);
    }

    deleteVitalSigns(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${id}`);
    }
}