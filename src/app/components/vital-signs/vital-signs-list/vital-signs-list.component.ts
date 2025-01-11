import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VitalSignsService } from '../../../services/vital-signs.service';
import { PatientService } from '../../../services/patient.service';
import { VitalSigns } from '../../../interfaces/vital-signs.interface';
import { Patient } from '../../../interfaces/patient.interface';
import { VitalSignsDTO } from '../../../interfaces/vital-signs-dto.interface';

@Component({
  selector: 'app-vital-signs-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './vital-signs-list.component.html',
  styleUrls: ['./vital-signs-list.component.css']
})
export class VitalSignsListComponent implements OnInit {
  vitalSigns: VitalSigns[] = [];
  patient: Patient | null = null;
  loading = false;
  error = '';
  vitalSignsForm: FormGroup;
  showForm = false;

  constructor(
    private vitalSignsService: VitalSignsService,
    private patientService: PatientService,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {
    this.vitalSignsForm = this.fb.group({
      heartRate: ['', [Validators.required, Validators.min(0), Validators.max(300)]],
      bloodPressureSystolic: ['', [Validators.required, Validators.min(0), Validators.max(300)]],
      bloodPressureDiastolic: ['', [Validators.required, Validators.min(0), Validators.max(300)]],
      bodyTemperature: ['', [Validators.required, Validators.min(30), Validators.max(45)]],
      oxygenSaturation: ['', [Validators.required, Validators.min(0), Validators.max(100)]]
    });
  }

  ngOnInit(): void {
    const patientId = this.route.snapshot.paramMap.get('id');
    if (patientId) {
      this.loadPatient(Number(patientId));
      this.loadVitalSigns(Number(patientId));
    }
  }

  loadPatient(patientId: number): void {
    this.patientService.getPatient(patientId).subscribe({
      next: (data) => {
        this.patient = data;
      },
      error: (error) => {
        console.error('Error loading patient:', error);
        this.error = 'Error al cargar los datos del paciente';
      }
    });
  }

  loadVitalSigns(patientId: number): void {
    this.loading = true;
    this.vitalSignsService.getVitalSigns(patientId).subscribe({
      next: (data) => {
        this.vitalSigns = data.sort((a, b) => 
          new Date(b.timestamp!).getTime() - new Date(a.timestamp!).getTime()
        );
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading vital signs:', error);
        this.error = 'Error al cargar los signos vitales';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.vitalSignsForm.valid && this.patient?.id) {
      const vitalSigns: VitalSignsDTO = {
        ...this.vitalSignsForm.value,
        patientId: this.patient.id
      };

      this.vitalSignsService.createVitalSigns(vitalSigns).subscribe({
        next: () => {
          this.loadVitalSigns(this.patient!.id!);
          this.vitalSignsForm.reset();
          this.showForm = false;
        },
        error: (error) => {
          console.error('Error saving vital signs:', error);
          this.error = 'Error al guardar los signos vitales';
        }
      });
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

  deleteVitalSigns(id: number): void {
    if (confirm('¿Está seguro de eliminar este registro?')) {
      this.vitalSignsService.deleteVitalSigns(id).subscribe({
        next: () => {
          this.loadVitalSigns(this.patient!.id!);
        },
        error: (error) => {
          console.error('Error deleting vital signs:', error);
          this.error = 'Error al eliminar el registro';
        }
      });
    }
  }

  // Getters para el formulario
  get heartRateControl() { return this.vitalSignsForm.get('heartRate'); }
  get bloodPressureSystolicControl() { return this.vitalSignsForm.get('bloodPressureSystolic'); }
  get bloodPressureDiastolicControl() { return this.vitalSignsForm.get('bloodPressureDiastolic'); }
  get bodyTemperatureControl() { return this.vitalSignsForm.get('bodyTemperature'); }
  get oxygenSaturationControl() { return this.vitalSignsForm.get('oxygenSaturation'); }
}