import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AlertService } from './alert.service';

@Injectable({
    providedIn: 'root'
})
export class AlertsStateService {
    private activeAlertsCountSubject = new BehaviorSubject<number>(0);
    activeAlertsCount$: Observable<number> = this.activeAlertsCountSubject.asObservable();

    constructor(private alertService: AlertService) {
        // Cargar el conteo inicial de alertas activas
        this.refreshActiveAlertsCount();
    }

    refreshActiveAlertsCount(): void {
        this.alertService.getActiveAlerts().subscribe({
            next: (alerts) => {
                const count = alerts?.length || 0;
                this.activeAlertsCountSubject.next(count);
            },
            error: (err) => {
                console.error('Error fetching active alerts count:', err);
                this.activeAlertsCountSubject.next(0);
            }
        });
    }
}