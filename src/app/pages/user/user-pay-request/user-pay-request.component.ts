import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { AddPaymentComponent } from 'src/app/components/modal/add-payment/add-payment.component';
import { LoginService } from 'src/app/services/login.service';
import { OrdersService } from 'src/app/services/orders.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-user-pay-request',
  templateUrl: './user-pay-request.component.html',
  styleUrls: ['./user-pay-request.component.css']
})
export class UserPayRequestComponent {

  dataPago: any
  hourMinutes: any
  order: any
  metodoPago: any
  documento: any
  orderId = 0

  user = {
    id: ''
  }

  orderData = {
    createdAt: '',
    status: '',
    streetAddress: '',
    deliveryPrice: 0,
    totalPrice: 0,
    preciocli: 0,
    subtotalPrice: 0,
    user: {
      id: '',
    },
    documento: '',
    fechaOperacion: '',
    noperacion: '',
    tipoOperacion: ''
  };

  constructor(
    private snack: MatSnackBar,
    public dialog: MatDialog,
    private loginService: LoginService,
    private orderService: OrdersService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.user = this.loginService.getUser();
    this.orderData.user.id = this.user.id;
    this.orderId = this.route.snapshot.params['orderId'];
    this.orderService.obtenerOrder(this.orderId).subscribe(
      (data) => {
        this.order = data
      }
    )
  }

  guardarInformacion() {
    console.log(this.dataPago)
    if(this.dataPago === undefined) {
      this.snack.open('El pago no ha sido registrado', '', {
        duration: 3000,
      });
      return;
    } 

    this.hourMinutes = this.dataPago.hourMinutes

    this.orderData.createdAt = this.getCurrentDate()
    this.orderData.subtotalPrice = this.order.subtotalPrice
    this.orderData.deliveryPrice = this.order.deliveryPrice
    this.orderData.totalPrice = this.order.totalPrice
    this.orderData.preciocli = this.order.preciocli
    this.orderData.documento = '76588310'
    this.orderData.streetAddress = this.order.streetAddress
    this.orderData.fechaOperacion = this.formatDate() + 'T' + this.getCurrentTimeFormatted()
    this.orderData.noperacion = this.dataPago.nOperacion
    this.order.status = 'Pagado';
    this.order.user = {
      accountNonExpired: false,
      accountNonLocked: false,
      apellido: null,
      authorities: null,
      credentialsNonExpired: false,
      email: null,
      enabled: false,
      id: this.order.user.id,
      nombre: null,
      password: null,
      perfil: null,
      telefono: null,
      username: null
    };
    this.orderService.actualizarOrder(this.order).subscribe(
    (data: any) => {
      console.log(data)
      Swal.fire('Orden guardada', 'Se ha agregado su orden', 'success')
      .then((e) => {
        this.router.navigate(['/user/historial-de-pedidos']);
      });
    },
    (error) => {
      console.log(error); 
      Swal.fire('Error !!', 'Error al cargar los datos', 'error');
    })
  }

  formatDate() {
    const fechaString = this.dataPago.fechaOperacion.toString();
  
    // Crear objeto de fecha
    const fecha = new Date(fechaString);
  
    // Obtener año, mes y día
    const year = fecha.getFullYear();
    const month = ('0' + (fecha.getMonth() + 1)).slice(-2); // Sumar 1 al mes ya que en JavaScript los meses van de 0 a 11
    const day = ('0' + fecha.getDate()).slice(-2);
  
    // Formatear en YYYY-MM-DD
    const formattedDate = `${year}-${month}-${day}`;
  
    return formattedDate;
  }

  getCurrentTimeFormatted() {
    if (this.hourMinutes) {
      const [hours, minutes] = this.hourMinutes.split(':');
      const horaReal = Number(hours) + 5;
      return `${horaReal.toString()}:${minutes}:00.000000`;
    } else {
      return 'this.hourMinutes no está definido o es undefined';
    }
  }
  totalCart() {
    return this.order.totalPrice || this.order.preciocli; // Usar totalPrice primero, fallback a preciocli
  }

  subtotal() {
    const subtotal = this.totalCart() * (1-0.18)
    return Number(subtotal.toFixed(2));
  }

  igv() {
    const igv = this.totalCart() * (0.18)
    return Number(igv.toFixed(2));
  }

  getCurrentDate(): string {
    const currentDate = new Date();
    return currentDate.toISOString();
  }


  openPaymentDialog(metodoPago: any) {
    this.metodoPago = metodoPago
    if(this.metodoPago === 1) {
      this.dataPago = undefined
      if(this.totalCart() > 500) {
        this.snack.open('El pago supera los S/.500 (Cantidad Máxima en Yape)', '', {
          duration: 3000,
        });
        return;
      }
      this.orderData.tipoOperacion = 'Yape'
      const dialogRef = this.dialog.open(AddPaymentComponent, {
        data: {
          metodoPago: 1,
          total: this.totalCart()
        },
        width: '50%',
        height: '82%'
      });

      dialogRef.afterClosed().subscribe(res => {
        this.dataPago = res.data
      })

    } 
    if(this.metodoPago === 2) {
      this.dataPago = undefined
      this.orderData.tipoOperacion = 'BCP'
      const dialogRef = this.dialog.open(AddPaymentComponent, {
        data: {
          metodoPago: 2,
          total: this.totalCart()
        },
        width: '45%',
        height: '82%'
      });

      dialogRef.afterClosed().subscribe(res => {
        this.dataPago = res.data
      })
    }
    if(this.metodoPago === 3) {
      this.dataPago = undefined
      if(this.totalCart() > 500) {
        this.snack.open('El pago supera los S/.500 (Cantidad Máxima en Plin)', '', {
          duration: 3000,
        });
        return;
      }
      this.orderData.tipoOperacion = 'Plin'
      const dialogRef = this.dialog.open(AddPaymentComponent, {
        data: {
          metodoPago: 3,
          total: this.totalCart()
        },
        width: '50%',
        height: '82%'
      });

      dialogRef.afterClosed().subscribe(res => {
        this.dataPago = res.data
      })
    }
    if(this.metodoPago === 4) {
      this.dataPago = undefined
      this.orderData.tipoOperacion = 'CCI'
      const dialogRef = this.dialog.open(AddPaymentComponent, {
        data: {
          metodoPago: 4,
          total: this.totalCart()
        },
        width: '45%',
        height: '82%'
      });

      dialogRef.afterClosed().subscribe(res => {
        this.dataPago = res.data
      })
    }
  }

}
