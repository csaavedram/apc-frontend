import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FacturaService } from 'src/app/services/factura.service';
import { FacturaDetailsService } from 'src/app/services/factura-details.service';
import { PaymentTermService } from 'src/app/services/payment-term.service';

@Component({
  selector: 'app-view-factura-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    FormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatRadioModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './view-factura-detail.component.html',
  styleUrl: './view-factura-detail.component.css'
})
export class ViewFacturaDetailComponent {

  loading = false;
  codigoCotizacion: string = '';
  detalleProductos: any[] = [];
  detalleServicios: any[] = [];
  usuario: any = null;
  facturaId = 0;
  nombreCliente: string = '';
  ruc: string = '';
  allDetails: any[] = [];

  facturaData = {
    divisa: '',
    tipoPago: '',
    total: 0.0,
    userId: null,
    tipo: 'bien',
    fechaEmision: null,
    usuarioId: '',
    codigo: '',
    productoId: null,
    nombreEmpresa: '',
    rucEmpresa: '',
  };

  plazaPagoTabla: {
    nroCuota: number;
    fechaInicio: string;
    fechaFin: string;
    monto: number;
  }[] = [];

  constructor(
    private snack: MatSnackBar,
    private route: ActivatedRoute,
    private facturaService: FacturaService,
    private facturaDetailService: FacturaDetailsService,
    private plazoPagoService: PaymentTermService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.loading = true;
    this.facturaId = this.route.snapshot.params['facturaId'];
    this.facturaService.obtenerFactura(this.facturaId).subscribe(
      (factura: any) => {
        console.log(factura);
        this.facturaData = {
          ...this.facturaData,
          divisa: factura.divisa,
          tipoPago: factura.tipoPago,
          fechaEmision: factura.fechaEmision,
          total: factura.total,
          userId: factura.user.id,
          codigo: factura.codigo
        };
        this.usuario = {
          id: factura.user.id,
          nombre: factura.user.nombre,
          apellido: factura.user.apellido,
          razonSocial: factura.user.razonSocial,
          ruc: factura.user.ruc,
          tipoUsuario: factura.user.tipoUsuario,
          username: factura.user.username
        };

        this.nombreCliente = this.usuario.tipoUsuario === 'empresa' ? this.usuario.nombre : `${this.usuario.nombre} ${this.usuario.apellido}`;
        this.ruc = this.usuario.username;

        this.facturaDetailService.listarFacturaDetailsPorFactura(factura.facturaId).subscribe(
          (detalles: any) => {
            this.allDetails = detalles;
            console.log('Detalles con series:', this.allDetails);

            this.detalleProductos = detalles.filter((detalle: any) => detalle.producto !== null).map((detalle: any) => ({
              cotizacionDetalleId: detalle.cotizacionDetalleId,
              productoId: detalle.producto.productoId,
              nombreProducto: detalle.producto.nombreProducto,
              cantidad: detalle.cantidad,
              precioUnitario: detalle.precioUnitario,
              precioNuevo: detalle.precioNuevo,
              precioTotal: detalle.precioTotal,
              igv: detalle.igv,
              numerosSerieAsignados: [] // Array vacío por defecto
            }));

            this.detalleServicios = detalles.filter((detalle: any) => detalle.tipoServicio !== null).map((detalle: any) => ({
              cotizacionDetalleId: detalle.cotizacionDetalleId,
              tipoServicio: detalle.tipoServicio,
              precioTotal: detalle.precioTotal,
              precioUnitario: detalle.precioUnitario
            }));

            this.loading = false;

            if(factura.tipoPago === 'Credito') {
              this.plazoPagoService.obtenerPlazosPagoPorFactura(factura.facturaId).subscribe(
                (plazosPago: any) => {
                  const totalPorPlazo = (this.detalleProductos.reduce((sum, detalle) => sum + detalle.precioUnitario * detalle.cantidad, 0) +
                                this.detalleServicios.reduce((sum, detalle) => sum + detalle.precioUnitario, 0)) / plazosPago.length;
                  this.plazaPagoTabla = plazosPago.map((plazo: any, index: any) => ({
                    nroCuota: index + 1,
                    fechaInicio: plazo.fechaInicio,
                    fechaFin: plazo.fechaFin,
                    monto: totalPorPlazo
                  }));
                },
                (error) => {
                  console.error('Error al obtener detalles de la cotización:', error);
                  this.snack.open('Error al obtener detalles de la cotización', '', {
                    duration: 3000
                  });
                }
              );
            }
          },
          (error: any) => {
            console.error('Error al obtener detalles de la cotización:', error);
            this.snack.open('Error al obtener detalles de la cotización', '', {
              duration: 3000
            });
            this.loading = false;
          }
        );
      },
      (error: any) => {
        console.error('Error al buscar la factura:', error);
        this.snack.open('Error al buscar la factura', '', {
          duration: 3000
        });
        this.loading = false;
      }
    );
  }

  volverAFacturas() {
    this.router.navigate(['/admin/facturas']);
  }

  calcularOpGravadas(): number {
    const totalProductos = this.detalleProductos.reduce((sum, detalle) => sum + detalle.precioUnitario * detalle.cantidad * 0.82, 0);
    const totalServicios = this.detalleServicios.reduce((sum, detalle) => sum + detalle.precioUnitario * 0.82, 0);
    return totalProductos + totalServicios;
  }

  calcularIgv(): number {
    const totalProductos = this.detalleProductos.reduce((sum, detalle) => sum + detalle.precioUnitario * detalle.cantidad * 0.18, 0);
    const totalServicios = this.detalleServicios.reduce((sum, detalle) => sum + detalle.precioUnitario * 0.18, 0);
    return totalProductos + totalServicios;
  }

  calcularTotal(): number {
    return this.detalleProductos.reduce((sum, detalle) => sum + detalle.precioUnitario * detalle.cantidad, 0) +
           this.detalleServicios.reduce((sum, detalle) => sum + detalle.precioUnitario, 0);
  }
}
