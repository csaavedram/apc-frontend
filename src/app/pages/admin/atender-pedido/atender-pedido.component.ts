import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { NewPriceComponent } from 'src/app/components/modal/new-price/new-price.component';
import { InventarioService } from 'src/app/services/inventario.service';
import { OrdersService } from 'src/app/services/orders.service';
import { OrdersDetailsService } from 'src/app/services/ordersdetails.service';
import { ProductoService } from 'src/app/services/producto.service';
import Swal from 'sweetalert2';

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
    private dialog: MatDialog // Import MatDialog
  ) { }

  orderId = 0;
  inventario: any;
  orderDetails: any = [];
  orders: any;
  product: any;
  cantidadAgregar: number = 0;

  ngOnInit(): void {
    this.orderId = this.route.snapshot.params['orderId'];
    console.log('Order ID:', this.orderId); // Agrega este log para verificar el valor
    this.ordersService.obtenerOrder(this.orderId).subscribe(
      (data) => {
        this.orders = data;
      },
      (error) => {
        console.log(error);
      }
    );
    this.orderDetailsService.listarOrdersDetailsByOrder(this.orderId).subscribe(
      (data: any) => {
        this.orderDetails = data[0];
        this.product = this.orderDetails.product;
      },
      (error) => {
        console.log(error);
      }
    );
  }

  volverAProductos() {
    this.router.navigate(['/admin/pedidos']); 
  }

  public rechazarSolicitud() {
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

    console.log(this.inventario);

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
        this.volverAProductos();
      },
      (error) => {
        Swal.fire('Error en el sistema', 'No se ha podido actualizar la información del producto', 'error');
        console.log(error);
      }
    );
  }

  public actualizarDatos() {
    if (this.orders.preciocli <= this.orders.totalPrice) {
      Swal.fire('Error', 'El monto a pagar debe ser mayor al precio referencial.', 'error');
      return;
    }

    const idUser = this.orders.user.id;
    this.orders.status = 'Aceptado';
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
        Swal.fire('Solicitud Aceptada', 'La solicitud ha sido aceptada correctamente', 'success');
       // this.volverAProductos();
       this.openProductDetailsModal(); // Abre el modal para ingresar el nuevo precio
      },
      (error) => {
        Swal.fire('Error en el sistema', 'No se ha podido actualizar la información del producto', 'error');
        console.log(error);
      }
    );
  }

  getCurrentDate(): string {
    const currentDate = new Date();
    return currentDate.toISOString();
  }
  public openProductDetailsModal() {
    if (!this.orderId) {
      console.error('orderId is undefined');
      return;
    }
  
    this.dialog.open(NewPriceComponent, {
      width: '600px',
      data: { orderId: this.orderId } // Pasa el orderId al modal
    });
  }
}