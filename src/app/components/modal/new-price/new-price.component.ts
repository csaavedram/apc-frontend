import { Component,Inject,OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ca, de } from 'date-fns/locale';
import { combineLatest } from 'rxjs';
import { OrdersService } from 'src/app/services/orders.service';
import { OrdersDetailsService } from 'src/app/services/ordersdetails.service';
import { QuotationService } from 'src/app/services/quotation.service';
import { QuotationDetailsService } from 'src/app/services/quotation-details.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-new-price',
 
  templateUrl: './new-price.component.html',
  styleUrls: ['./new-price.component.css']
})
export class NewPriceComponent implements OnInit {
ordersDetails: any[]=[];


quotationData: any= {
    divisa: '',
    plazoEntrega: this.getCurrentDate(),
    tipoPago: '',
    total: 0.0,
    user: {id:null,},
    validezOferta: this.getCurrentDate(),
    estado: 'Creado',
};

  orderId = 0;
  currentPage1 = 1;
  rowsPerPage1 = 10;
  totalPages1 = 0;

  constructor(
    private ordersDetailsService: OrdersDetailsService,
    private route: ActivatedRoute,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public data: any, // Recibe los datos del producto
    private dialogRef: MatDialogRef<NewPriceComponent>,
    private ordersService: OrdersService,
    private quotationService: QuotationService,
    private quotationDetailsService: QuotationDetailsService
  ) {}

  prevPage1(): void {
    if (this.currentPage1 > 1) {
      this.currentPage1--;
    }
    
  }
  
  EnviarCotizaYDetalles(): void {
    this.quotationData.estado = 'Creado';
    this.quotationService.agregarQuotation(this.quotationData).subscribe((cotizacion:any) => {
      console.log('Payload enviado:', this.quotationData); // Agrega este log para verificar los datos
      const cotizacionId = cotizacion.quotationId; // Obtén el ID de la cotización creada
      this.ordersDetails.forEach((detalle: any) => {
        const quotationDetails = {
          cantidad: detalle.quantity,
          totalPrice: detalle.totalPrice,
          unitPrice: detalle.unitPrice,
          newPrice: detalle.newPrice, // Puedes ajustar este valor si es necesario
          serviceType: null,
          product: {
            productoId: detalle.product.productoId, // Asocia el producto
          },
          quotation: {
            quotationId: cotizacionId, // Asocia la cotización creada
          },
          createdAt: new Date(),
        };
        console.log('Detalles de cotización:', quotationDetails); // Agrega este log para verificar los datos
        this.quotationDetailsService.agregarQuotationDetail(quotationDetails).subscribe(
          ()=>console.log('Detalles de cotización creados:', quotationDetails),
        (error) => console.error('Error al crear detalles de cotización:', error)
        );
      });

    Swal.fire('Éxito', 'La cotización y sus detalles han sido guardados correctamente', 'success');
    this.dialogRef.close();
    this.router.navigate(['/admin/pedidos']); // Navega de regreso a la vista de productos
  });}
 

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
    return this.ordersDetails.slice(startIndex, endIndex);
  }
  getCurrentDate(): string {
    const currentDate = new Date();
    return currentDate.toISOString();
  }


  ngOnInit(): void {
    console.log('ORDER ID:', this.data.orderId); // Agrega este log para verificar el valor
    this.orderId = this.data.orderId; // Obtén el orderId desde los datos del modal
    combineLatest([this.ordersDetailsService.listarOrdersDetailsByOrder(this.orderId)]).subscribe(
      ([ordersDetails]: [any]) => {
        console.log('ORDERS DETAILS:', ordersDetails); // Agrega este log para verificar los datos
        this.ordersDetails = ordersDetails.map((detalle:any)=> ({
          ...detalle,
          newPrice: null}));
        this.calculateTotalPages1();
        
      },
      (error) => {
        console.log(error);
        Swal.fire('Error', 'Error al cargar los datos', 'error');
      }
    );
    combineLatest([this.ordersService.obtenerOrder(this.orderId)]).subscribe(
      ([orders]: [any]) => {
        console.log('ORDERS:', orders); // Agrega este log para verificar los datos
        const userId = orders.user.id;
        console.log('USER ID:', userId); // Agrega este log para verificar el valor
  
        this.quotationData = {
          divisa: "Soles",
          tipoPago: "Contado",
          plazoEntrega:this.getCurrentDate(), // 1 día en milisegundos
          validezOferta: this.getCurrentDate(), // 1 día en milisegundos
          total: orders.totalPrice, //total price de orders_details
          user:{
            id: userId,
            },
          
        };
        console.log('QUOTATION DATA:', this.quotationData); // Agrega este log para verificar los datos


      },
      (error) => {
        console.log(error);
        Swal.fire('Error', 'Error al cargar los datos', 'error');
      }
    );
  }

 
  buttonDisabled = false;
  
}
