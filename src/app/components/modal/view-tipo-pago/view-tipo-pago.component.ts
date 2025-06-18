import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Inject } from '@angular/core';
import { OrdenCotizacionService } from 'src/app/services/orden-cotizacion.service';
import { PaymentTermService } from 'src/app/services/payment-term.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './view-tipo-pago.component.html',
  styleUrl: './view-tipo-pago.component.css',
})
export class ViewTipoPagoComponent implements OnInit {
  user: any = null;
  ordenCotizacionData: any[] = [];

  loading = false;

  constructor(
    private dialogRef: MatDialogRef<ViewTipoPagoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { orderId: number },
    private ordenCotizacionService: OrdenCotizacionService,
    private plazoPagoService: PaymentTermService,
    private snack: MatSnackBar
  ) {}

  ngOnInit() {
    this.loading = true;
    this.ordenCotizacionService.obtenerOrdenCotizacionPorOrderId(this.data.orderId).subscribe(
      (data: any) => {
        this.ordenCotizacionData = data;
        const tipoPago = this.ordenCotizacionData[0]?.cotizacion?.tipoPago;

        if (tipoPago === 'Contado') {
          console.log('El tipo de pago es Contado. Se realiza el pago en una sola cuota.');
        } else if (tipoPago === 'Credito') {
          const cotizacionId = this.ordenCotizacionData[0]?.cotizacion?.cotizacionId;
          this.plazoPagoService.obtenerPlazosPagoPorCotizacion(cotizacionId).subscribe(
            (plazosPago: any) => {
              this.ordenCotizacionData[0].plazoPagoData = plazosPago.sort((a: any, b: any) => a.nroCuota - b.nroCuota);
              console.log('Plazos de pago ordenados:', this.ordenCotizacionData[0].plazoPagoData);
              this.loading = false;
            },
            (error) => {
              console.error('Error al obtener detalles de los plazos de pago:', error);
              this.snack.open('Error al obtener detalles de los plazos de pago', '', {
                duration: 3000
              });
            }
          );
        }
      },
      (error) => {
        console.error('Error al obtener orden de cotización:', error);
      }
    );
  }

  closeModel() {
    this.dialogRef.close();
  }

  sendPayment(data: any) {
    const installments = Number(data.installments);
    const totalAmount = Number(data.amount);

  }
}
