import { Component, OnInit } from '@angular/core';
import { OrdersService } from 'src/app/services/orders.service';
import { LoginService } from 'src/app/services/login.service';
import Swal from 'sweetalert2';
import { combineLatest } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { PaymentComponent } from '../../../components/modal/payment/payment.component';
import { OrdenCotizacionService } from 'src/app/services/orden-cotizacion.service';
import { InventarioService } from 'src/app/services/inventario.service';
import { OrdersDetailsService } from 'src/app/services/ordersdetails.service';

@Component({
  selector: 'app-user-history-order',
  templateUrl: './user-history-order.component.html',
  styleUrls: ['./user-history-order.component.css']
})
export class UserHistoryOrderComponent implements OnInit {
  user: any = null;
  orders: any = [];
  currentPage1 = 1;
  rowsPerPage1 = 10;
  totalPages1 = 0;

  constructor(
    private ordersService: OrdersService,
    private ordersDetailsService: OrdersDetailsService,
    private loginService: LoginService,
    private ordenCotizacionService: OrdenCotizacionService,
    private inventarioService: InventarioService,
    private dialog: MatDialog
  ) {}

  prevPage1(): void {
    if (this.currentPage1 > 1) {
      this.currentPage1--;
    }
  }

  nextPage1(): void {
    if (this.currentPage1 < this.totalPages1) {
      this.currentPage1++;
    }
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
    return this.orders.slice(startIndex, endIndex);
  }

  openPaymentModal(orderId: string) {
    const dialogRef = this.dialog.open(PaymentComponent, {
      width: '500px',
      data: { orderId },
    });

    dialogRef.afterClosed().subscribe(
      () => {
        this.listarOrdersByUser();
      },
      (error) => {
        console.error('Error closing payment modal:', error);
      }
    );
  }

  rechazarPedido(orderId: number): void {
    Swal.fire({
      title: '¿Está seguro de rechazar el pedido?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, rechazar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.ordersService.rechazarOrder(orderId).subscribe(
          () => {
            this.ordersDetailsService.listarOrdersDetailsByOrder(orderId).subscribe(
              (orderDetails: any) => {
                const movimientos = orderDetails.map((detalle: any) => ({
                  producto: {
                    productoId: detalle.product.productoId
                  },
                  cantidad: detalle.quantity,
                  tipo: 'Devuelto',
                  dateCreated: new Date().toISOString().split('T')[0]
                }));

                movimientos.forEach((movimiento: any) => {
                  this.inventarioService.agregarProductoInventario(movimiento).subscribe(
                    () => console.log('Movimiento registrado:', movimiento),
                    (error: any) => console.error('Error al registrar movimiento:', error)
                  );
                });

                Swal.fire('Pedido Rechazado', 'El pedido ha sido rechazado correctamente', 'success');
                this.listarOrdersByUser();
              },
              (error: any) => {
                Swal.fire('Error', 'No se pudieron obtener los detalles de la orden', 'error');
                console.error(error);
              }
            );
          },
          (error: any) => {
            Swal.fire('Error', 'No se pudo rechazar el pedido', 'error');
            console.error(error);
          }
        );
      }
    });
  }

  aceptarPedido(orderId: number): void {
    Swal.fire({
      title: '¿Está seguro de aceptar el pedido?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, aceptar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.ordersService.aceptarOrder(orderId).subscribe(
          () => {
            Swal.fire('Pedido Aceptado', 'El pedido ha sido aceptado correctamente', 'success');
            this.listarOrdersByUser();
          },
          (error: any) => {
            Swal.fire('Error', 'No se pudo aceptar el pedido', 'error');
            console.error(error);
          }
        );
      }
    });
  }

  listarOrdersByUser() {
    this.user = this.loginService.getUser();
    combineLatest([this.ordersService.listarOrdersByUser(this.user.id)]).subscribe(
      ([orders]: [any]) => {
        // Ordenar los pedidos por fecha de creación, de más reciente a más antiguo
        this.orders = orders.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        this.calculateTotalPages1();

        this.ordenCotizacionService.obtenerOrdenCotizacionPorOrderId(orders.orderId)
      },
      (error) => {
        console.log(error);
        Swal.fire('Error', 'Error al cargar los datos', 'error');
      }
    );
  }

  ngOnInit(): void {
    this.listarOrdersByUser();
  }
}
