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
import { FacturaDetailsService } from 'src/app/services/facturadetails.service';

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

  constructor(
    private snack: MatSnackBar,
    private route: ActivatedRoute,
    private facturaService: FacturaService,
    private facturaDetailService: FacturaDetailsService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.loading = true;
    this.facturaId = this.route.snapshot.params['facturaId'];
    this.facturaService.obtenerFactura(this.facturaId).subscribe(
      (factura: any) => {
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
          tipoUsuario: factura.user.tipoUsuario
        };

        this.nombreCliente = this.usuario.tipoUsuario === 'Empresa' ? this.usuario.razonSocial : `${this.usuario.nombre} ${this.usuario.apellido}`;
        this.ruc = this.usuario.ruc;

        this.facturaDetailService.listarFacturaDetailsPorFactura(factura.facturaId).subscribe(
          (detalles: any) => {
            this.allDetails = detalles;
            console.log(this.allDetails)
            this.detalleProductos = detalles.filter((detalle: any) => detalle.product !== null).map((detalle: any) => ({
              quotationdetailsId: detalle.quotationdetailsId,
              productoId: detalle.product.productoId,
              nombreProducto: detalle.product.nombreProducto,
              cantidad: detalle.cantidad,
              unitPrice: detalle.unitPrice,
              newPrice: detalle.newPrice,
              totalPrice: detalle.totalPrice,
              igv: detalle.igv
            }));

            this.detalleServicios = detalles.filter((detalle: any) => detalle.serviceType !== null).map((detalle: any) => ({
              quotationdetailsId: detalle.quotationdetailsId,
              serviceType: detalle.serviceType,
              totalPrice: detalle.totalPrice,
              unitPrice: detalle.unitPrice
            }));

            this.loading = false;
          },
          (error) => {
            console.error('Error al obtener detalles de la cotización:', error);
            this.snack.open('Error al obtener detalles de la cotización', '', {
              duration: 3000
            });
            this.loading = false;
          }
        );
      },
      (error) => {
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
    const totalProductos = this.detalleProductos.reduce((sum, detalle) => sum + detalle.newPrice * detalle.cantidad * 0.82, 0); // 82% of new price for products
    const totalServicios = this.detalleServicios.reduce((sum, detalle) => sum + detalle.price * 0.82, 0); // 82% of total price for services
    return totalProductos + totalServicios;
  }

  calcularIgv(): number {
    const totalProductos = this.detalleProductos.reduce((sum, detalle) => sum + detalle.newPrice * detalle.cantidad * 0.18, 0); // 18% of new price for products
    const totalServicios = this.detalleServicios.reduce((sum, detalle) => sum + detalle.price * 0.18, 0); // 18% of total price for services
    return totalProductos + totalServicios;
  }

  calcularTotal(): number {
    return this.detalleProductos.reduce((sum, detalle) => sum + detalle.newPrice * detalle.cantidad, 0) +
           this.detalleServicios.reduce((sum, detalle) => sum + detalle.price, 0); // Total is the sum of all new prices
  }
}
