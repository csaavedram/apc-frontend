import { Component, OnInit } from '@angular/core';
import { OrdersService } from 'src/app/services/orders.service';
import { LoginService } from 'src/app/services/login.service';
import Swal from 'sweetalert2';
import { combineLatest } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { PaymentComponent } from '../../../components/modal/payment/payment.component';

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
    private loginService: LoginService,
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
      (result) => {
        if (result) {
          this.listarOrdersByUser();
        }
      },
      (error) => {
        console.error('Error closing payment modal:', error);
      }
    );
  }

  listarOrdersByUser() {
    this.user = this.loginService.getUser();
    combineLatest([this.ordersService.listarOrdersByUser(this.user.id)]).subscribe(
      ([orders]: [any]) => {
        // Ordenar los pedidos por fecha de creación, de más reciente a más antiguo
        this.orders = orders.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        this.calculateTotalPages1();
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
