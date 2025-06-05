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

  guardarPlazos(): void {
    console.log('Plazos guardados:', this.plazos); // Debugging output
    this.plazosGuardados.emit(this.plazos);
    this.dialogRef.close(this.plazos);
  }

  cancelarPlazos(): void {
    this.dialogRef.close(null);
  }
}
