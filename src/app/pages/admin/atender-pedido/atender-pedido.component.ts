import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest } from 'rxjs';
import { OrdersService } from 'src/app/services/orders.service';
import { OrdersDetailsService } from 'src/app/services/ordersdetails.service';
import { QuotationDetailsService } from 'src/app/services/quotation-details.service';
import { QuotationService } from 'src/app/services/quotation.service';
import { InventarioService } from 'src/app/services/inventario.service';
import { ProductoService } from 'src/app/services/producto.service';
import Swal from 'sweetalert2';
import { OrdenCotizacionService } from 'src/app/services/orden-cotizacion.service';
import { MatDialog } from '@angular/material/dialog';
import { AddPlazosPagoComponent } from 'src/app/components/modal/add-plazos-pago/add-plazos-pago.component';
import { PaymentTermService } from 'src/app/services/payment-term.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-atender-pedido',
  templateUrl: './atender-pedido.component.html',
  styleUrls: ['./atender-pedido.component.css']
})
export class AtenderPedidoComponent implements OnInit {

  constructor(
    private snack: MatSnackBar,
    private route: ActivatedRoute,
    private ordersService: OrdersService,
    private orderDetailsService: OrdersDetailsService,
    private inventarioService: InventarioService,
    private productoService: ProductoService,
    private router: Router,
    private quotationService: QuotationService,
    private quotationDetailsService: QuotationDetailsService,
    private ordenCotizacionService: OrdenCotizacionService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private paymentTermService: PaymentTermService // Added PaymentTermService
  ) { }

  quotationData: any= {
    cotizacionId: 0,
    divisa: '',
    plazoEntrega: '',
    tipoPago: '',
    total: 0.0,
    user: { id: null },
    validezOferta: '',
    estado: 'Por aceptar',
    createdAt: new Date(),
  };

  plazoPagoData = {
    fechaInicio: '',
    fechaFin: ''
  }

  orderId = 0;
  inventario: any;
  orderDetails: any = [];
  cotizacionDetails: any = [];
  orders: any;
  product: any;
  cantidadAgregar: number = 0;
  currentPage1 = 1;
  rowsPerPage1 = 10;
  totalPages1 = 0;
  userId = 0;
  currentDate: string = '';
  nroPlazos: number = 0;

  ngOnInit(): void {
    this.currentDate = this.getCurrentDate();
    this.orderId = this.route.snapshot.params['orderId'];

    this.ordersService.obtenerOrder(this.orderId).subscribe(
      (data) => {
        this.orders = data;
        console.log(this.orders);        combineLatest([this.orderDetailsService.listarOrdersDetailsByOrder(this.orderId)]).subscribe(
          ([data]: [any]) => {
            this.orderDetails = data.map((detalle: any) => ({
              ...detalle,
              newPrice: null, // Inicializar como null, se llenará cuando el usuario edite
            }));

            console.log('📦 OrderDetails cargados:', this.orderDetails);

            this.product = this.orderDetails[0].product;
            
            // Calcular total inicial con precios originales
            const totalP = this.orderDetails.reduce(
              (acc: any, detalle: any) => {
                const precio = detalle.unitPrice; // Usar precio original inicialmente
                const total = precio * detalle.quantity;
                console.log(`💰 Inicialización - Precio: ${precio}, Cantidad: ${detalle.quantity}, Total: ${total}`);
                return acc + total;
              },
              0
            );

            console.log('📊 Total inicial calculado:', totalP);
            this.quotationData.total = totalP;
            this.userId = this.orderDetails[0].order.user.id;

            this.quotationData = {
              divisa: '',
              tipoPago: this.orders.tipoPago || '',
              plazoEntrega: this.currentDate,
              validezOferta: this.currentDate,
              total: this.quotationData.total,
              user: {
                id: this.userId,
              },
              createdAt: this.currentDate,
            };

            // Trigger change detection to avoid ExpressionChangedAfterItHasBeenCheckedError
            this.cdr.detectChanges();
          },
          (error) => {
            console.log(error);
          }
        );
      },
      (error) => {
        console.log(error);
      }
    );
  }

  prevPage1(): void {
    if (this.currentPage1 > 1) this.currentPage1--;
  }

  nextPage1(): void {
    if (this.currentPage1 < this.totalPages1) this.currentPage1++;
  }

  volverAPedidos() {
    this.router.navigate(['/admin/pedidos']);
  }

  calculateTotalPages1(): void {
    this.totalPages1 = Math.ceil(this.displayedOrders().length / this.rowsPerPage1);
    if (this.currentPage1 > this.totalPages1) {
      this.currentPage1 = 1;
    }
  }

  displayedOrders(): any[] {
    const startIndex = (this.currentPage1 - 1) * this.rowsPerPage1;
    const endIndex = startIndex + this.rowsPerPage1;
    return this.orderDetails.slice(startIndex, endIndex);
  }

  getCurrentDate(): string {
    const currentDate = new Date();
    return currentDate.toISOString().split('T')[0];
  }  calcularTotalCotizacion(): void {
    console.log('🔄 Iniciando cálculo de total de cotización...');
    console.log('📦 OrderDetails actuales:', this.orderDetails);
    
    this.quotationData.total = this.orderDetails.reduce((sum: number, detalle: any, index: number) => {
      console.log(`🔍 Procesando detalle ${index + 1}:`, detalle);
      
      // En orderDetails, los campos son: unitPrice, quantity, newPrice
      // Si newPrice existe (precio editado), usarlo; sino, usar unitPrice (precio original)
      const precio = detalle.newPrice || detalle.unitPrice;
      const cantidad = detalle.quantity;
      const total = precio * cantidad;
      
      console.log(`💰 Detalle ${index + 1}: newPrice=${detalle.newPrice}, unitPrice=${detalle.unitPrice}, precio usado=${precio}, cantidad=${cantidad}, total=${total}`);
      
      // Verificar si algún valor es NaN
      if (isNaN(precio) || isNaN(cantidad) || isNaN(total)) {
        console.warn(`⚠️ Valores NaN detectados en detalle ${index + 1}:`, { precio, cantidad, total });
      }
      
      return sum + (isNaN(total) ? 0 : total);
    }, 0);
    
    console.log('📊 Total final de cotización:', this.quotationData.total);
    
    if (isNaN(this.quotationData.total)) {
      console.error('❌ El total final es NaN');
      this.quotationData.total = 0;
    }
  }

  EnviarCotizaYDetalles(): void {
    this.quotationData.estado = 'Por aceptar';
    console.log('Iniciando envío de cotización y detalles:', this.quotationData);

    this.quotationService.agregarQuotation(this.quotationData).subscribe(
      (cotizacion: any) => {
        this.quotationData.quotationId = cotizacion.cotizacionId;

        const ordenCotizacionData = {
          cotizacion: { cotizacionId: this.quotationData.quotationId },
          order: { orderId: this.orderId },
        };

        this.ordenCotizacionService.agregarOrdenCotizacion(ordenCotizacionData).subscribe(() => {});        const detallesCotizacion = this.orderDetails.map((detalle: any) => {
          // Usar newPrice si existe (precio editado), sino unitPrice (precio original)
          const precioUnitario = detalle.newPrice || detalle.unitPrice;
          const precioTotal = precioUnitario * detalle.quantity; // Calcular total con precio correcto
          
          return {
            cantidad: detalle.quantity,
            precioTotal: precioTotal,          
            precioUnitario: precioUnitario,
            tipoServicio: null,
            producto: {
              productoId: detalle.product.productoId,
            },
            cotizacion: { cotizacionId: this.quotationData.quotationId },
            createdAt: this.getCurrentDate(),
          };
        });



        detallesCotizacion.forEach((detalleCotizacion: any) => {
          this.quotationDetailsService.agregarQuotationDetail(detalleCotizacion).subscribe(
            () => {
              this.quotationData.total = detallesCotizacion.reduce(
                (sum: number, detalle: any) => sum + detalle.precioUnitario * detalle.cantidad,
                0
              );              const data = { 
                preciocli: this.quotationData.total,
                totalPrice: this.quotationData.total // Actualizar también el totalPrice con el precio correcto
              };
              console.log('Actualizando orden con datos:', data);              this.ordersService.atenderOrder(this.orders.orderId, data).subscribe(() => {
                  // Actualizar los orderDetails con los precios cotizados
                this.orderDetails.forEach((detalle: any) => {
                  const precioUnitarioCotizado = detalle.newPrice || detalle.unitPrice; // Usar newPrice si existe, sino unitPrice
                  const precioTotalCotizado = precioUnitarioCotizado * detalle.quantity;
                  
                  const orderDetailActualizado = {
                    ordersdetailsId: detalle.ordersdetailsId,
                    quantity: detalle.quantity,
                    unitPrice: precioUnitarioCotizado, // Usar precio cotizado como precio unitario
                    totalPrice: precioTotalCotizado, // Usar precio total cotizado
                    order: { orderId: this.orders.orderId },
                    product: { productoId: detalle.product.productoId },
                    createdAt: detalle.createdAt
                  };
                  
                  console.log('Actualizando orderDetail:', orderDetailActualizado);
                  this.orderDetailsService.actualizarOrderDetail(orderDetailActualizado).subscribe(
                    () => console.log('✅ OrderDetail actualizado correctamente'),
                    (error) => console.error('❌ Error al actualizar orderDetail:', error)
                  );
                });
                
                const totalPorPlazo = this.quotationData.total / this.nroPlazos;

                const plazosPago = Array.isArray(this.plazoPagoData)
                  ? this.plazoPagoData.map((plazo: any, index: number) => ({
                      cantidad: totalPorPlazo,
                      cotizacion: { cotizacionId: this.quotationData.quotationId },
                      fechaInicio: plazo.fechaInicio,
                      fechaFin: plazo.fechaFin,
                      estado: "Pendiente",
                      nroCuota: index + 1
                    }))
                  : [{
                      cantidad: totalPorPlazo,
                      cotizacion: { cotizacionId: this.quotationData.quotationId },
                      fechaInicio: this.plazoPagoData.fechaInicio,
                      fechaFin: this.plazoPagoData.fechaFin,
                      estado: "Pendiente",
                      nroCuota: 1
                    }];

                plazosPago.forEach((plazoPago) => {
                  this.paymentTermService.agregarPlazoPago(plazoPago).subscribe(
                    () => {},
                    (error) => {
                      console.error('Error al guardar plazo de pago:', error);
                    }
                  );
                });

                Swal.fire('Solicitud Aceptada', 'La solicitud ha sido aceptada correctamente', 'success');
                this.volverAPedidos();
              });
            },
            (error: any) => {
              console.error('Error al agregar detalles de cotización:', error);
              Swal.fire('Error', 'No se pudieron agregar los detalles de la cotización', 'error');
            }
          );
        });
      },
      (error: any) => {
        console.error('Error al guardar la cotización:', error);
        Swal.fire('Error', 'Ocurrió un error al guardar la cotización', 'error');
      }
    );
  }

  rechazarSolicitud() {
    this.product.stock = this.orderDetails.product.stock + this.orderDetails.quantity;
    this.productoService.actualizarProducto(this.product).subscribe(
      (data) => {
        console.log(data);
      },
      (error) => {
        console.log(error);
      }
    );

    this.inventario = {
      cantidad: this.orderDetails.quantity,
      dateCreated: this.getCurrentDate(),
      tipo: 'Reintegrado',
      producto: {
        productoId: this.product.productoId,
      },
    };

    this.inventarioService.agregarProductoInventario(this.inventario).subscribe(
      (data) => {
        console.log(data);
      },
      (error) => {
        console.log(error);
      }
    );

    const idUser = this.orders.user.id;
    this.orders.status = 'Rechazado';
    this.orders.user = {
      accountNonExpired: false,
      accountNonLocked: false,
      apellido: null,
      authorities: null,
      credentialsNonExpired: false,
      email: null,
      enabled: false,
      id: idUser,
      nombre: null,
      password: null,
      perfil: null,
      telefono: null,
      username: null
    };

    this.ordersService.actualizarOrder(this.orders).subscribe(
      (data) => {
        this.orders = data;
        Swal.fire('Solicitud Rechazada', 'La solicitud ha sido rechazada correctamente', 'success');
        this.volverAPedidos();
      },
      (error) => {
        Swal.fire('Error en el sistema', 'No se ha podido actualizar la información del producto', 'error');
        console.log(error);
      }
    );
  }

  buscarPlazos(): void {
    if (this.nroPlazos <= 1) {
      this.snack.open('Debe ingresar mínimo 2 nros. de plazos', '', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
      return;
    }

    const dialogRef = this.dialog.open(AddPlazosPagoComponent, {
      width: '500px',
      data: { cantidadPlazos: this.nroPlazos },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.plazoPagoData = result;
      }
    });
  }
}
