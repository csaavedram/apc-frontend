import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PaymentService } from '../../../services/mercado-pago.service';
import { PaymentTermService } from 'src/app/services/payment-term.service';
import { FacturaService } from 'src/app/services/factura.service';
import { FacturaDetailsService } from 'src/app/services/factura-details.service';
import { MatDialogRef } from '@angular/material/dialog';
import { OrdersService } from 'src/app/services/orders.service';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Inject } from '@angular/core';
import { OrdenCotizacionService } from 'src/app/services/orden-cotizacion.service';
import { QuotationService } from 'src/app/services/quotation.service';
import { QuotationDetailsService } from 'src/app/services/quotation-details.service';
import { LoginService } from 'src/app/services/login.service';

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
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css'],
})
export class PaymentComponent implements OnInit {
  private mp: any;
  user: any = null;
  email: string = '';
  cotizacion: any = [];
  cantidadPorPlazo: number = 0;
  cantidadPlazos: number = 0;

  loading = false;

  constructor(
    private dialogRef: MatDialogRef<PaymentComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { orderId: number, nroCuota: number, plazoPago: any },
    private paymentService: PaymentService,
    private facturaService: FacturaService,
    private facturaDetailsService: FacturaDetailsService,
    private plazosPagoService: PaymentTermService,
    private ordersService: OrdersService,
    private cotizacionDetailsService: QuotationDetailsService,
    private ordenCotizacionService: OrdenCotizacionService,
    private loginService: LoginService,
    private cotizacionService: QuotationService
  ) {}

  async ngOnInit() {
    this.loading = true;
    this.user = this.loginService.getUser();
    this.ordenCotizacionService.obtenerOrdenCotizacionPorOrderId(this.data.orderId).subscribe(
      (ordenCotizacion: any) => {
        this.cotizacion = ordenCotizacion[0].cotizacion;
        this.plazosPagoService.obtenerPlazosPagoPorCotizacion(this.cotizacion.cotizacionId).subscribe(
          (plazosPago: any) => {
            if (this.cotizacion.tipoPago === 'Credito') {
              this.cantidadPlazos = plazosPago.length;
              this.cantidadPorPlazo = plazosPago[0].cantidad;
            }
            this.initializeBrick();
          },
          (error) => {
            console.error('❌ Error obteniendo plazos de pago:', error);
            this.loading = false;
          }
        );
      },
      (error: any) => {
        console.error('❌ Error obteniendo orden de cotización:', error);
        this.loading = false;
      }
    );
  }

  async initializeBrick() {
    try {
      this.mp = await this.paymentService.initializeMercadoPago();
      const bricksBuilder = this.mp.bricks();

      const amountToPay = this.cantidadPorPlazo || this.cotizacion.total;

      const settings = {
        initialization: {
          amount: amountToPay,
          payer: {
            email: ''
          }
        },
        customization: {
          visual: {
            style: {
              theme: 'default',
            },
          },
          paymentMethods: {
            maxInstallments: 1,
          },
        },
        callbacks: {
          onReady: () => {
            this.loading = false;
            console.log('✅ Brick listo');
          },
          onSubmit: (cardFormData: any) => {
            return new Promise((resolve, reject) => {
              try {
                this.sendPayment(cardFormData);
                resolve('Pago procesado correctamente');
              } catch (error) {
                console.error('❌ Error en el pago:', error);
                console.log(error)
                reject(error);
              }
            });
          },
          onError: (error: any) => {
            console.error('❌ Error en el Brick:', error);
            if (error?.message || error?.cause) {
              console.error('📩 Detalles:', JSON.stringify(error, null, 2));
            }
          },
        },
      };

      bricksBuilder.create('cardPayment', 'cardPaymentBrick_container', settings).then(() => {
        console.log('✅ Brick creado exitosamente');
      }).catch((error: any) => {
        console.error('❌ Error creando el Brick:', error);
      });
    } catch (error) {
      console.error('❌ Error inicializando MercadoPago:', error);
      this.loading = false;
    }
  }

  closeModel() {
    this.dialogRef.close();
  }

  addFactura(facturaPayload: any) {
    this.facturaService.agregarFactura(facturaPayload).subscribe(
      (factura: any) => {
        this.cotizacionDetailsService.listarQuotationsDetailsByQuotation(this.cotizacion.cotizacionId).subscribe(
          (cotizacionDetail: any) => {
            const detalleProductos = cotizacionDetail.filter((detalle: any) => detalle.producto !== null).map((detalle: any) => ({
              cantidad: detalle.cantidad,
              precioTotal: detalle.precioTotal,
              precioUnitario: detalle.precioUnitario,
              tipoServicio: null,
              producto: { productoId: detalle.producto.productoId },
              factura: { facturaId: factura.facturaId },
              createdAt: new Date(),
            }));

            const detalleServicios = cotizacionDetail.filter((detalle: any) => detalle.tipoServicio !== null).map((detalle: any) => ({
              cantidad: 1,
              precioTotal: detalle.precioTotal,
              precioUnitario: detalle.precioUnitario,
              productoId: null,
              factura: { facturaId: factura.facturaId },
              createdAt: new Date(),
              tipoServicio: detalle.tipoServicio,
            }));

            detalleProductos.forEach((detalle: any) => {
              this.facturaDetailsService.agregarFacturaDetail(detalle).subscribe(
                () => console.log('✅ Detalle de producto guardado'),
                (error) => console.error('❌ Error al guardar detalle de producto:', error)
              );
            });

            detalleServicios.forEach((detalle: any) => {
              this.facturaDetailsService.agregarFacturaDetail(detalle).subscribe(
                () => console.log('✅ Detalle de servicio guardado'),
                (error) => console.error('❌ Error al guardar detalle de servicio:', error)
              );
            });
          },
          (error: any) => {
            console.error('❌ Error obteniendo detalles de la cotización:', error);
          }
        );
      },
      (err: any) => {
        console.error('❌ Error creando factura:', err);
      }
    );
  }

  sendPayment(data: any) {
    console.log(data);

    const payload = {
      description: 'Pago aprobado',
      installments: data.installments,
      payer: {
        email: data.payer.email,
        identification: {
          type: data.payer.identification.type,
          number: data.payer.identification.number,
        },
      },
      token: data.token,
      transaction_amount: data.transaction_amount,
      payment_method_id: data.payment_method_id,
    };

    this.paymentService.createPayment(payload).subscribe(
      async (response: any) => {
        console.log('✅ Pago exitoso:', response);

        const promises = [];

        if (this.cotizacion.tipoPago === 'Credito') {
          if (this.data.nroCuota === 1) {
            promises.push(this.ordersService.pagarParcialmenteOrder(this.data.orderId).toPromise());
            promises.push(this.cotizacionService.pagarParcialmenteCotizacion(this.cotizacion.cotizacionId).toPromise());

            const facturaPayload = {
              divisa: this.cotizacion.divisa,
              tipoPago: this.cotizacion.tipoPago,
              total: this.cotizacion.total,
              user: { id: this.user.id },
              fechaEmision: new Date(),
              estado: 'Pagado',
              cotizacion: { cotizacionId: this.cotizacion.cotizacionId },
            };
            this.addFactura(facturaPayload);

            promises.push(this.plazosPagoService.cambiarEstadoAPagado(this.data.plazoPago.plazoPagoId).toPromise());
          }

          if (this.data.nroCuota > 1 && this.data.nroCuota < this.cantidadPlazos) {
            promises.push(this.plazosPagoService.cambiarEstadoAPagado(this.data.plazoPago.plazoPagoId).toPromise());
          }

          if (this.cantidadPlazos === this.data.nroCuota) {
            promises.push(this.ordersService.pagarOrder(this.data.orderId).toPromise());
            promises.push(this.cotizacionService.pagarCotizacion(this.cotizacion.cotizacionId).toPromise());
            promises.push(this.plazosPagoService.cambiarEstadoAPagado(this.data.plazoPago.plazoPagoId).toPromise());
          }
        }

        if (this.cotizacion.tipoPago === 'Contado') {
          promises.push(this.ordersService.pagarOrder(this.data.orderId).toPromise());
          promises.push(this.cotizacionService.pagarCotizacion(this.cotizacion.cotizacionId).toPromise());

          const facturaPayload = {
            divisa: this.cotizacion.divisa,
            tipoPago: this.cotizacion.tipoPago,
            total: this.cantidadPorPlazo,
            user: { id: this.user.id },
            fechaEmision: new Date(),
            estado: 'Pagado',
            cotizacion: { cotizacionId: this.cotizacion.cotizacionId },
          };
          this.addFactura(facturaPayload);
        }

        await Promise.all(promises);
        console.log('✅ Todas las operaciones completadas');
        this.closeModel();
      },
      (error: any) => {
        console.error('❌ Error en el pago MP:', error);
      }
    );
  }

}
