// user-order-details.component.ts
import { Component, OnInit } from '@angular/core';
import { OrdersDetailsService } from 'src/app/services/ordersdetails.service';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { combineLatest } from 'rxjs';
import { PdfService } from 'src/app/services/pdf.service';
import { FacturaService } from 'src/app/services/factura.service';
import { OrdenCotizacionService } from 'src/app/services/orden-cotizacion.service';
import { OrdersService } from 'src/app/services/orders.service';

@Component({
  selector: 'app-user-order-details',
  templateUrl: './user-order-details.component.html',
  styleUrls: ['./user-order-details.component.css']
})
export class UserOrderDetailsComponent implements OnInit {
  ordersDetails: any[] = [];
  orderId = 0;
  currentPage1 = 1;
  rowsPerPage1 = 10;
  totalPages1 = 0;
  buttonDisabled = false;

  constructor(
    private ordersDetailsService: OrdersDetailsService,
    private route: ActivatedRoute,
    private facturaService: FacturaService,
    private orderCotizacionService: OrdenCotizacionService,
    private orderService: OrdersService,
    private router: Router,
    private pdfService: PdfService
  ) {}

  prevPage1(): void {
    if (this.currentPage1 > 1) {
      this.currentPage1--;
    }
    this.updateButtonState();
  }

  nextPage1(): void {
    if (this.currentPage1 < this.totalPages1) {
      this.currentPage1++;
    }
    this.updateButtonState();
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

  ngOnInit(): void {
    this.orderId = this.route.snapshot.params['orderId'];
    combineLatest([this.ordersDetailsService.listarOrdersDetailsByOrder(this.orderId)]).subscribe(
      ([ordersDetails]: [any]) => {
        this.ordersDetails = ordersDetails;
        this.calculateTotalPages1();
        this.updateButtonState();
      },
      (error) => {
        console.log(error);
        Swal.fire('Error', 'Error al cargar los datos', 'error');
      }
    );
  }

  downloadPdf() {
    this.orderCotizacionService.obtenerOrdenCotizacionPorOrderId(this.orderId).subscribe(
      (ordenCotizacion: any) => {
        const cotizacionId = ordenCotizacion[0].cotizacion.cotizacionId;
        this.facturaService.obtenerFacturaPorCotizacion(cotizacionId).subscribe(
          (factura: any) => {
            this.pdfService.generatePdfFactura(factura[0].facturaId);
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

  updateButtonState() {
    this.orderService.obtenerOrder(this.orderId).subscribe(
      (order: any) => {
        console.log(order)
        if (order.status === 'Pagado') {
          this.buttonDisabled = true;
        } else {
          this.buttonDisabled = false;
        }
      },
      (error) => {
        console.log(error);
        this.buttonDisabled = false;
      }
    );
  }

  goBack(): void {
    this.router.navigate(['user/historial-de-pedidos']);
  }
}
