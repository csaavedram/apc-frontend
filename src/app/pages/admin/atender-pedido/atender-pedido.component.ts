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
    private quotationDetailsService: QuotationDetailsService
  ) { }
  quotationData: any= {
    quotationId: 0,
    divisa: '',
    plazoEntrega: this.getCurrentDate(),
    tipoPago: '',
    total: 0.0,
    user: {id:null,},
    validezOferta: this.getCurrentDate(),
    estado: 'En aceptar',
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
    console.log('Order ID:', this.orderId); // Agrega este log para verificar el valor
    this.ordersService.obtenerOrder(this.orderId).subscribe(
      (data) => {
        this.orders = data;
        console.log('Order:', this.orders); // Agrega este log para verificar los datos
      },
      (error) => {
        console.log(error);
      }
    );
    combineLatest([ this.orderDetailsService.listarOrdersDetailsByOrder(this.orderId)]).subscribe(
      ([data]: [any]) => {
        console.log('Data:', data); // Agrega este log para verificar los datos
        this.orderDetails = data.map((detalle:any)=> ({
          ...detalle,
          newPrice: null}));;
        this.product = this.orderDetails[0].product;
        console.log('Product:', this.product); // Agrega este log para verificar el producto
        console.log('Order Details:', this.orderDetails); // Agrega este log para verificar los detalles del pedido
        const totalP= this.orderDetails.reduce((acc: any, detalle: any) => acc + detalle.totalPrice, 0);
        this.quotationData.total = totalP;
        this.userId = this.orderDetails[0].order.user.id;
        //datos iniciales de la cotización
        this.quotationData = {
          divisa: "Soles",
          tipoPago: "Contado",
          plazoEntrega:this.getCurrentDate(), // 1 día en milisegundos
          validezOferta: this.getCurrentDate(), // 1 día en milisegundos
          total: this.quotationData.total, //total price de orders_details
          user:{
            id: this.userId,
            },
          createdAt: this.getCurrentDate(),
          
        };
        console.log('QUOTATION DATA:', this.quotationData); // Agrega este log para verificar los datos

      },
      (error) => {
        console.log(error);
      }
    );
  }
  prevPage1(): void {
    if (this.currentPage1 > 1) {
      this.currentPage1--;}}
  
  nextPage1(): void {
        if (this.currentPage1 < this.totalPages1) {
          this.currentPage1++;}}

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
      const precio = detalle.newPrice || detalle.unitPrice; // Usa newPrice si está definido, de lo contrario unitPrice
      return sum + precio * detalle.quantity ;
    }, 0);
  }

  EnviarCotizaYDetalles(): void {
    
      this.quotationData.estado = 'En aceptar';
      this.quotationService.agregarQuotation(this.quotationData).subscribe((cotizacion:any) => {
        console.log('Payload enviado:', this.quotationData); // Agrega este log para verificar los datos
         this.quotationData.quotationId = cotizacion.quotationId; // Obtén el ID de la cotización creada
        console.log('IdCotizacion:', this.quotationData.quotationId); // Agrega este log para verificar el ID de la cotización
        this.orderDetails.forEach((detalle: any) => {
          const detalleCotizacion = {
            cantidad: detalle.quantity,
            totalPrice: detalle.totalPrice,
            unitPrice: detalle.unitPrice,
            newPrice: detalle.newPrice, // Puedes ajustar este valor si es necesario
            
            serviceType: null,
            product: {
              productoId: detalle.product.productoId, // Asocia el producto
              
            },
            quotation: this.quotationData,
            createdAt: this.getCurrentDate(),
          };
          this.cotizacionDetails.push(detalleCotizacion);
          console.log('Detalles de cotización:', this.cotizacionDetails); // Agrega este log para verificar los datos
          this.quotationDetailsService.agregarQuotationDetail( detalleCotizacion).subscribe(
            (Refresh)=>{
          const totalPrecioNew= this.cotizacionDetails.reduce((detalle: any) =>  detalle.newPrice, 0);
          this.quotationData.total = totalPrecioNew;
          this.quotationService.actualizarQuotation( this.quotationData).subscribe(
            () => {},
          (error) => console.error('Error al crear detalles de cotización:', error)
          );}
                );
                console.log('Detalles de cotización creados:', this.quotationData); // Agrega este log para verificar los datos
         
        });
        const idUser = this.orders.user.id;
        this.orders.status = 'Aceptado';
        this.orders.preciocli= this.quotationData.total;
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
            this.volverAPedidos();
         
          },
          (error) => {
            Swal.fire('Error en el sistema', 'No se ha podido actualizar la información del producto', 'error');
            console.log(error);
          }
        );
      Swal.fire('Éxito', 'La cotización y sus detalles han sido guardados correctamente', 'success');
     this.volverAPedidos();
    });
  
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
        this.volverAPedidos();
      },
      (error) => {
        Swal.fire('Error en el sistema', 'No se ha podido actualizar la información del producto', 'error');
        console.log(error);
      }
    );
  }
}