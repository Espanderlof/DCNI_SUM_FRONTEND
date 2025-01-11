import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PatientService } from '../../../services/patient.service';
import { Patient } from '../../../interfaces/patient.interface';
import { Router, RouterModule } from '@angular/router';

@Component({
    selector: 'app-patient-list',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './patient-list.component.html',
    styleUrls: ['./patient-list.component.css']
})
export class PatientListComponent implements OnInit {
    patients: Patient[] = [];
    filteredPatients: Patient[] = [];
    searchTerm: string = '';
    loading = false;
    error = '';

    constructor(
        private patientService: PatientService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.loadPatients();
    }

    loadPatients(): void {
        this.loading = true;
        this.patientService.getPatients().subscribe({
            next: (data) => {
                this.patients = data;
                this.filteredPatients = data;
                this.loading = false;
            },
            error: (error) => {
                console.error('Error loading patients:', error);
                this.error = 'Error al cargar los pacientes';
                this.loading = false;
            }
        });
    }

    search(): void {
        if (!this.searchTerm.trim()) {
            this.filteredPatients = this.patients;
            return;
        }

        const searchTermLower = this.searchTerm.toLowerCase();
        this.filteredPatients = this.patients.filter(patient =>
            patient.name.toLowerCase().includes(searchTermLower) ||
            patient.rut.toLowerCase().includes(searchTermLower) ||
            patient.roomNumber.toLowerCase().includes(searchTermLower)
        );
    }

    viewDetails(patient: Patient): void {
        this.router.navigate(['/patients/details', patient.id]);
    }

    editPatient(patient: Patient): void {
        this.router.navigate(['/patients/edit', patient.id]);
    }

    deletePatient(id: number): void {
        if (confirm('¿Está seguro de eliminar este paciente?')) {
            this.patientService.deletePatient(id).subscribe({
                next: () => {
                    this.loadPatients();
                },
                error: (error) => {
                    console.error('Error deleting patient:', error);
                    this.error = 'Error al eliminar el paciente';
                }
            });
        }
    }
}