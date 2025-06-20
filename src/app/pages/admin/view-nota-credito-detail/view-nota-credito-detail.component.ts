import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NotaCreditoDetailsService } from 'src/app/services/nota-credito-details.service';
import { NotaCreditoService } from 'src/app/services/nota-credito.service';
import { PaymentTermService } from 'src/app/services/payment-term.service';

@Component({
  selector: 'app-view-nota-credito-detail',
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
  templateUrl: './view-nota-credito-detail.component.html',
  styleUrl: './view-nota-credito-detail.component.css'
})
export class ViewNotaCreditoDetailComponent {
  loading = false;
  detalleProductos: any[] = [];
  detalleServicios: any[] = [];
  usuario: any = null;
  notaCreditoId = 0;
  nombreCliente: string = '';
  ruc: string = '';
  allDetails: any[] = [];

  notaData = {
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
    private notaCreditoService: NotaCreditoService,
    private notaCreditoDetailService: NotaCreditoDetailsService,
    private plazoPagoService: PaymentTermService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.loading = true;
    this.notaCreditoId = this.route.snapshot.params['notaCreditoId'];
    console.log('Nota de crédito ID:', this.notaCreditoId);
    this.notaCreditoService.obtenerNotaCredito(this.notaCreditoId).subscribe(
      (nota: any) => {
        this.notaData = {
          ...this.notaData,
          divisa: nota.divisa,
          tipoPago: nota.tipoPago,
          fechaEmision: nota.fechaEmision,
          total: nota.total,
          userId: nota.user.id,
          codigo: nota.codigo
        };
        this.usuario = {
          id: nota.user.id,
          nombre: nota.user.nombre,
          apellido: nota.user.apellido,
          razonSocial: nota.user.razonSocial,
          ruc: nota.user.ruc,
          tipoUsuario: nota.user.tipoUsuario,
          username: nota.user.username
        };

        this.nombreCliente = this.usuario.tipoUsuario === 'empresa' ? this.usuario.nombre : `${this.usuario.nombre} ${this.usuario.apellido}`;
        this.ruc = this.usuario.username;

        this.notaCreditoDetailService.listarNotasCreditoDetailsPorNotaCredito(nota.notaCreditoId).subscribe(
          (detalles: any) => {
            this.allDetails = detalles;
            this.detalleProductos = detalles.filter((detalle: any) => detalle.producto !== null).map((detalle: any) => ({
              notaCreditoDetalleId: detalle.notaCreditoDetalleId,
              productoId: detalle.producto.productoId,
              nombreProducto: detalle.producto.nombreProducto,
              cantidad: detalle.cantidad,
              precioUnitario: detalle.precioUnitario,
              precioTotal: detalle.precioTotal,
              igv: detalle.igv
            }));

            this.detalleServicios = detalles.filter((detalle: any) => detalle.tipoServicio !== null).map((detalle: any) => ({
              cotizacionDetalleId: detalle.cotizacionDetalleId,
              tipoServicio: detalle.tipoServicio,
              precioTotal: detalle.precioTotal,
              precioUnitario: detalle.precioUnitario
            }));

            this.loading = false;

            if(nota.tipoPago === 'Credito') {
              this.plazoPagoService.obtenerPlazosPagoPorNotaCredito(nota.notaCreditoId).subscribe(
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
          (error) => {
            console.error('Error al obtener detalles de la nota de crédito:', error);
            this.snack.open('Error al obtener detalles de la nota de crédito', '', {
              duration: 3000
            });
            this.loading = false;
          }
        );
      },
      (error) => {
        console.error('Error al buscar la nota de crédito:', error);
        this.snack.open('Error al buscar la nota de crédito', '', {
          duration: 3000
        });
        this.loading = false;
      }
    );
  }

  volverANotasCredito() {
    this.router.navigate(['/admin/notascredito']);
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
