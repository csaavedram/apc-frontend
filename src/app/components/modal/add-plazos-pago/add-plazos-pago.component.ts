import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-add-plazos-pago',
  standalone: true,
  imports: [FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatDatepickerModule, CommonModule],
  templateUrl: './add-plazos-pago.component.html',
  styleUrls: ['./add-plazos-pago.component.css']
})
export class AddPlazosPagoComponent implements OnInit {
  @Output() plazosGuardados = new EventEmitter<any[]>();

  nroPlazos: number = 0;
  plazos: { fechaInicio: Date | null; fechaFin: Date | null }[] = [];

  constructor(@Inject(MAT_DIALOG_DATA) public data: { cantidadPlazos: number }, private dialogRef: MatDialogRef<AddPlazosPagoComponent>) {
    this.nroPlazos = data.cantidadPlazos;
  }

  ngOnInit(): void {
    this.plazos = Array.from({ length: this.nroPlazos }, () => ({ fechaInicio: null, fechaFin: null }));
  }

  onFirstDateChange(newDate: Date | null): void {
    if (newDate) {
      // Calculate all payment terms based on the first date with 30-day intervals
      for (let i = 0; i < this.plazos.length; i++) {
        const startDate = new Date(newDate);
        startDate.setDate(startDate.getDate() + (i * 30));
        
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 29); // 30-day period (inclusive)
        
        this.plazos[i] = {
          fechaInicio: startDate,
          fechaFin: endDate
        };
      }
    } else {
      // Clear all dates if first date is cleared
      this.plazos = Array.from({ length: this.nroPlazos }, () => ({ fechaInicio: null, fechaFin: null }));
    }
  }

  guardarPlazos(): void {
    console.log('Plazos guardados:', this.plazos); // Debugging output
    this.plazosGuardados.emit(this.plazos);
    this.dialogRef.close(this.plazos);
  }

  cancelarPlazos(): void {
    this.dialogRef.close(null);
  }
}
