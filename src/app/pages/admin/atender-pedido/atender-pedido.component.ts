import { Component, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-atender-pedido',
  templateUrl: './atender-pedido.component.html',
  styleUrls: ['./atender-pedido.component.css']
})
export class AtenderPedidoComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private ordersService: OrdersService,
    private orderDetailsService: OrdersDetailsService,
    private inventarioService: InventarioService,
    private productoService: ProductoService,
    private router: Router,
    private quotationService: QuotationService,
    private quotationDetailsService: QuotationDetailsService,
    private ordenCotizacionService: OrdenCotizacionService
  ) { }

  quotationData: any= {
    cotizacionId: 0,
    divisa: '',
    plazoEntrega: this.getCurrentDate(),
    tipoPago: '',
    total: 0.0,
    user: { id: null },
    validezOferta: this.getCurrentDate(),
    estado: 'Por aceptar',
    createdAt: new Date(),
  };

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

  ngOnInit(): void {
    this.orderId = this.route.snapshot.params['orderId'];
    this.ordersService.obtenerOrder(this.orderId).subscribe(
      (data) => {
        this.orders = data;
      },
      (error) => {
        console.log(error);
      }
    );
    combineLatest([ this.orderDetailsService.listarOrdersDetailsByOrder(this.orderId)]).subscribe(
      ([data]: [any]) => {
        this.orderDetails = data.map((detalle:any)=> ({
          ...detalle,
          newPrice: null}));;
        this.product = this.orderDetails[0].product;
        const totalP= this.orderDetails.reduce((acc: any, detalle: any) => acc + detalle.totalPrice, 0);
        this.quotationData.total = totalP;
        this.userId = this.orderDetails[0].order.user.id;

        this.quotationData = {
          divisa: "Soles",
          tipoPago: "Contado",
          plazoEntrega:this.getCurrentDate(),
          validezOferta: this.getCurrentDate(),
          total: this.quotationData.total,
          user:{
            id: this.userId,
            },
          createdAt: this.getCurrentDate(),

        };
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
    return currentDate.toISOString();
  }

  calcularTotalCotizacion(): void {
    this.quotationData.total = this.orderDetails.reduce((sum: number, detalle: any) => {
      console.log(detalle);
      const precio = detalle.newPrice || detalle.unitPrice;
      return sum + precio * detalle.quantity ;
    }, 0);
  }

  EnviarCotizaYDetalles(): void {
    this.quotationData.estado = 'Por aceptar';
    this.quotationService.agregarQuotation(this.quotationData).subscribe(
      (cotizacion: any) => {
        this.quotationData.quotationId = cotizacion.cotizacionId;

        const ordenCotizacionData = {
          cotizacion: { cotizacionId: this.quotationData.quotationId },
          order: { orderId: this.orderId },
        }

        this.ordenCotizacionService.agregarOrdenCotizacion(ordenCotizacionData).subscribe(() => {})

        const detallesCotizacion = this.orderDetails.map((detalle: any) => ({
          cantidad: detalle.quantity,
          precioTotal: detalle.totalPrice,
          precioUnitario: detalle.unitPrice,
          precioNuevo: detalle.newPrice,
          tipoServicio: null,
          producto: {
            productoId: detalle.product.productoId,
          },
          cotizacion: { cotizacionId: this.quotationData.quotationId },
          createdAt: this.getCurrentDate(),
        }));

        detallesCotizacion.forEach((detalleCotizacion: any) => {
          this.quotationDetailsService.agregarQuotationDetail(detalleCotizacion).subscribe(
            () => {
              this.quotationData.total = detallesCotizacion.reduce((sum: number, detalle: any) => sum + (detalle.precioNuevo || detalle.precioUnitario) * detalle.cantidad, 0);
              console.log(this.quotationData.total)
              const data = { preciocli: this.quotationData.total }
              this.ordersService.atenderOrder(this.orders.orderId, data).subscribe(
                () => {
                  Swal.fire('Solicitud Aceptada', 'La solicitud ha sido aceptada correctamente', 'success');
                  this.volverAPedidos();
                }
              )
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
}
