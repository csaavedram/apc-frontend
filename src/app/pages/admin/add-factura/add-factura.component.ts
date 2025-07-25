import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { QuotationService } from 'src/app/services/quotation.service';
import { QuotationDetailsService } from 'src/app/services/quotation-details.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import Swal from 'sweetalert2';
import { FacturaService } from 'src/app/services/factura.service';
import { FacturaDetailsService } from 'src/app/services/factura-details.service';
import { PaymentTermService } from 'src/app/services/payment-term.service';

@Component({
  selector: 'app-add-factura',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    FormsModule,
    RouterModule,
    MatButton,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatRadioModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './add-factura.component.html',
  styleUrls: ['./add-factura.component.css']
})
export class AddFacturaComponent {
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

  codigoCotizacion = '';

  usuario = {
    id: '',
    nombre: '',
    apellido: '',
    razonSocial: '',
    ruc: '',
    tipoUsuario: '',
    username: ''
  };

  plazoPagoData: any[] = [];

  plazaPagoTabla: {
    nroCuota: number;
    fechaInicio: string;
    fechaFin: string;
    monto: number;
  }[] = [];

  productos: any[] = [];
  servicios: any[] = [];
  detalleProductos: any[] = [];
  detalleServicios: any[] = [];
  cotizacionEncontradaId = 0;
  allDetails: any[] = [];
  selectedProduct: any = null;
  selectedServiceType = { type: '', price: 0 };
  skuChanged: boolean = false;
  items: any[] = [];
  tipoBusqueda = 'ruc';
  listaUsuarios: any[] = [];
  usuarioInput: string = '';
  suggestions: string[] = [];
  filteredSuggestions: string[] = [];

  nombreCliente = '';
  ruc = '';

  busquedaRealizada: boolean = false;

  constructor(
    private snack: MatSnackBar,
    private quotationService: QuotationService,
    private quotationDetailsService: QuotationDetailsService,
    private facturaService: FacturaService,
    private paymentTermService: PaymentTermService,
    private facturaDetailService: FacturaDetailsService,
    private plazoPagoService: PaymentTermService,
    private router: Router,
  ) {}

  buscarCotizacionPorCodigo(): void {
    this.busquedaRealizada = true;
    this.detalleProductos = [];
    this.detalleServicios = [];

    const codigo = this.codigoCotizacion.trim();
    if (!codigo) {
      this.snack.open('Debe ingresar un código de cotización válido', '', {
        duration: 3000
      });
      this.busquedaRealizada = false;
      return;
    }

    this.facturaService.listarFacturasPorCodigoCotizacion(codigo).subscribe(
      (factura: any) => {
        if (factura.length > 0) {
          this.snack.open('Ya existe una factura con ese código de cotización', '', {
            duration: 3000
          });
          this.busquedaRealizada = false;
          return;
        } else {
          this.quotationService.obtenerCotizacionPorCodigo(codigo).subscribe(
            (cotizacion: any) => {
              if (cotizacion) {
                this.cotizacionEncontradaId = cotizacion.cotizacionId;
                this.facturaData = {
                  ...this.facturaData,
                  divisa: cotizacion.divisa,
                  tipoPago: cotizacion.tipoPago,
                  fechaEmision: cotizacion.fechaEmision,
                  total: cotizacion.total,
                  userId: cotizacion.user.id,
                  codigo: cotizacion.codigo
                };
                this.usuario = {
                  id: cotizacion.user.id,
                  nombre: cotizacion.user.nombre,
                  apellido: cotizacion.user.apellido,
                  razonSocial: cotizacion.user.razonSocial,
                  ruc: cotizacion.user.ruc,
                  tipoUsuario: cotizacion.user.tipoUsuario,
                  username: cotizacion.user.username
                };

                this.nombreCliente = this.usuario.tipoUsuario === 'empresa' ? this.usuario.nombre : `${this.usuario.nombre} ${this.usuario.apellido}`;
                this.ruc = this.usuario.username;

                this.quotationDetailsService.listarQuotationsDetailsByQuotation(cotizacion.cotizacionId).subscribe(
                  (detalles: any) => {
                    this.allDetails = detalles;
                    console.log('Detalles de la cotización:', detalles);
                    this.detalleProductos = detalles.filter((detalle: any) => detalle.producto !== null).map((detalle: any) => ({
                      cotizacionDetalleId: detalle.cotizacionDetalleId,
                      productoId: detalle.producto.productoId,
                      nombreProducto: detalle.producto.nombreProducto,
                      cantidad: detalle.cantidad,
                      precioUnitario: detalle.precioUnitario, // Usar precioUnitario directamente
                      precioTotal: detalle.precioTotal,
                      igv: detalle.igv
                    }));

                    this.detalleServicios = detalles.filter((detalle: any) => detalle.tipoServicio !== null).map((detalle: any) => ({
                      cotizacionDetalleId: detalle.cotizacionDetalleId,
                      tipoServicio: detalle.tipoServicio,
                      precioTotal: detalle.precioTotal,
                      precioUnitario: detalle.precioUnitario
                    }));

                    this.busquedaRealizada = false;

                    this.plazoPagoService.obtenerPlazosPagoPorCotizacion(cotizacion.cotizacionId).subscribe(
                      (plazosPago: any) => {
                        this.plazoPagoData = plazosPago;
                        const totalPorPlazo = (this.detalleProductos.reduce((sum, detalle) => sum + detalle.precioUnitario * detalle.cantidad, 0) +
                                      this.detalleServicios.reduce((sum, detalle) => sum + detalle.precioUnitario, 0)) / plazosPago.length;
                        this.plazaPagoTabla = this.plazoPagoData.map((plazo, index) => ({
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

                  },
                  (error) => {
                    console.error('Error al obtener detalles de la cotización:', error);
                    this.snack.open('Error al obtener detalles de la cotización', '', {
                      duration: 3000
                    });
                    this.busquedaRealizada = false;
                  }
                );

                this.snack.open('Cotización encontrada', '', {
                  duration: 3000
                });
              } else {
                this.snack.open('No se encontró una cotización con ese código', '', {
                  duration: 3000
                });
                this.busquedaRealizada = false;
              }
            },
            (error) => {
              console.error('Error al buscar la cotización:', error);
              this.snack.open('Error al buscar la cotización', '', {
                duration: 3000
              });
              this.busquedaRealizada = false;
            }
          );
        }
      },
      (error) => {
        console.error('Error al buscar la factura por código:', error);
        this.snack.open('Error al buscar la factura por código', '', {
          duration: 3000
        });
        this.busquedaRealizada = false;
        return;
      }
    );
  }

  volverAFacturas() {
    this.router.navigate(['/admin/facturas']);
  }

  guardarInformacion(): void {
    const facturaPayload = {
      divisa: this.facturaData.divisa,
      tipoPago: this.facturaData.tipoPago,
      fechaEmision: new Date(),
      total: this.calcularTotal(),
      user: {
        id: this.usuario.id,
      },
      estado: 'Creado',
      cotizacion: {
        cotizacionId: this.cotizacionEncontradaId
      }
    };

    this.facturaService.agregarFactura(facturaPayload).subscribe(
      (factura: any) => {
        const facturaId = factura.facturaId;

        this.detalleProductos.forEach((detalle) => {
          const detalleProductoPayload = {
            cantidad: detalle.cantidad,
            precioTotal: detalle.precioTotal,
            precioUnitario: detalle.precioUnitario,
            tipoServicio: null,
            producto: { productoId: detalle.productoId },
            factura: { facturaId: facturaId },
            createdAt: new Date(),
          };

          this.facturaDetailService.agregarFacturaDetail(detalleProductoPayload).subscribe(
            () => console.log('✅ Detalle de producto guardado'),
            (error) => console.error('❌ Error al guardar detalle de producto:', error)
          );

        });

        this.detalleServicios.forEach((detalle) => {
          const detalleServicioPayload = {
            cantidad: 1,
            precioTotal: detalle.precioTotal,
            precioUnitario: detalle.precioUnitario,
            productoId: null,
            factura: { facturaId: facturaId },
            createdAt: new Date(),
            tipoServicio: detalle.tipoServicio,
          };

          this.facturaDetailService.agregarFacturaDetail(detalleServicioPayload).subscribe(
            () => console.log('✅ Detalle de servicio guardado'),
            (error) => console.error('❌ Error al guardar detalle de servicio:', error)
          );
        });

        // Si plazoPagoData es un solo objeto, no un array
        console.log(this.plazoPagoData);

        this.plazoPagoData.forEach((plazoPago) => {
          const plazoPagoPayload = {
            facturaId: factura.facturaId
          };

          this.paymentTermService.actualizarFacturaDePlazoPago(plazoPago.plazoPagoId, plazoPagoPayload).subscribe(
            (data: any) => {
              console.log('Plazo de pago actualizado:', data);
            },
            (error) => {
              console.error('Error al actualizar plazo de pago:', error);
            }
          );
        });

        Swal.fire('Éxito', 'La factura ha sido guardada correctamente', 'success')
          .then(() => {
            this.router.navigate(['/admin/facturas']);
          });
      },
      (error) => {
        console.error('Error al guardar la cotización:', error);
        Swal.fire('Error', 'Ocurrió un error al guardar la cotización', 'error');
      }
    );
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
