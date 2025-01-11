import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PatientService } from '../../../services/patient.service';
import { Patient } from '../../../interfaces/patient.interface';

@Component({
    selector: 'app-patient-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './patient-form.component.html',
    styleUrls: ['./patient-form.component.scss']
})
export class PatientFormComponent implements OnInit {
    patientForm: FormGroup;
    isEditing = false;
    loading = false;
    error = '';
    patientId?: number;

    constructor(
        private fb: FormBuilder,
        private patientService: PatientService,
        private router: Router,
        private route: ActivatedRoute
    ) {
        this.patientForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(3)]],
            rut: ['', [Validators.required, Validators.pattern(/^[0-9]{7,8}-[0-9kK]{1}$/)]],
            dateOfBirth: ['', Validators.required],
            medicalHistory: ['', Validators.required],
            roomNumber: ['', Validators.required]
        });
    }

    ngOnInit(): void {
        this.patientId = Number(this.route.snapshot.paramMap.get('id'));
        if (this.patientId) {
            this.isEditing = true;
            this.loadPatient();
        }
    }

    loadPatient(): void {
        if (this.patientId) {
            this.loading = true;
            this.patientService.getPatient(this.patientId).subscribe({
                next: (patient) => {
                    this.patientForm.patchValue({
                        ...patient,
                        dateOfBirth: this.formatDate(patient.dateOfBirth)
                    });
                    this.loading = false;
                },
                error: (error) => {
                    console.error('Error loading patient:', error);
                    this.error = 'Error al cargar los datos del paciente';
                    this.loading = false;
                }
            });
        }
    }

    onSubmit(): void {
        if (this.patientForm.valid) {
            this.loading = true;
            const patientData = this.patientForm.value;

            const operation = this.isEditing ?
                this.patientService.updatePatient(this.patientId!, patientData) :
                this.patientService.createPatient(patientData);

            operation.subscribe({
                next: () => {
                    this.router.navigate(['/patients']);
                },
                error: (error) => {
                    console.error('Error saving patient:', error);
                    this.error = 'Error al guardar los datos del paciente';
                    this.loading = false;
                }
            });
        } else {
            this.markFormGroupTouched(this.patientForm);
        }
    }

    private markFormGroupTouched(formGroup: FormGroup): void {
        Object.values(formGroup.controls).forEach(control => {
            control.markAsTouched();
            if (control instanceof FormGroup) {
                this.markFormGroupTouched(control);
            }
        });
    }

    private formatDate(date: string): string {
        return date.split('T')[0];
    }

    cancel(): void {
        this.router.navigate(['/patients']);
    }

    // Getters para facilitar la validación en el template
    get nameControl() { return this.patientForm.get('name'); }
    get rutControl() { return this.patientForm.get('rut'); }
    get dateOfBirthControl() { return this.patientForm.get('dateOfBirth'); }
    get medicalHistoryControl() { return this.patientForm.get('medicalHistory'); }
    get roomNumberControl() { return this.patientForm.get('roomNumber'); }
}