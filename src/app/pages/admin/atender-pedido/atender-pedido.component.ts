import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest } from 'rxjs';
import { OrdersService } from 'src/app/services/orders.service';
import { OrdersDetailsService } from 'src/app/services/ordersdetails.service';
import { QuotationDetailsService } from 'src/app/services/quotation-details.service';
import { QuotationService } from 'src/app/services/quotation.service';
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
        this.quotationData.total = totalP+15;
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

  volverAProductos() {
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
          const totalPrecioNew= this.cotizacionDetails.reduce((acc: any, detalle: any) => acc + detalle.newPrice, 0);
          this.quotationData.total = totalPrecioNew+15;
          this.quotationService.actualizarQuotation( this.quotationData).subscribe(
            () => {},
          (error) => console.error('Error al crear detalles de cotización:', error)
          );}
                );
                console.log('Detalles de cotización creados:', this.quotationData); // Agrega este log para verificar los datos
         
        });
  
      Swal.fire('Éxito', 'La cotización y sus detalles han sido guardados correctamente', 'success');
     
    });}
   
}