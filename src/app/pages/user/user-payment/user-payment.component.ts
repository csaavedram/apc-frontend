import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-user-payment',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    RouterModule
  ],
  templateUrl: './user-payment.component.html',
  styleUrl: './user-payment.component.css'
})

export class UserPaymentComponent {

   constructor(
      private paymentService: PaymentService,
      private facturaService: FacturaService,
      private facturaDetailsService: FacturaDetailsService,
      private paymentTermService: PaymentTermService,
      private loginService: LoginService,
      private ordersService: OrdersService
    ) {}
  
    async ngOnInit() {
      setTimeout(async () => {
        this.loading = true;
        this.mp = await this.paymentService.initializeMercadoPago();
        this.user = this.loginService.getUser();
  
        this.cardForm = this.mp.cardForm({
          amount: '100.5',
          iframe: true,
          form: {
            id: 'form-checkout',
            cardNumber: { id: 'form-checkout__cardNumber', placeholder: 'Número de tarjeta' },
            expirationDate: { id: 'form-checkout__expirationDate', placeholder: 'MM/YY' },
            securityCode: { id: 'form-checkout__securityCode', placeholder: 'Código de seguridad' },
            cardholderName: { id: 'form-checkout__cardholderName', placeholder: 'Titular de la tarjeta' },
            issuer: { id: 'form-checkout__issuer', placeholder: 'Banco emisor' },
            installments: { id: 'form-checkout__installments', placeholder: 'Cuotas' },
            identificationType: { id: 'form-checkout__identificationType', placeholder: 'Tipo de documento' },
            identificationNumber: { id: 'form-checkout__identificationNumber', placeholder: 'Número del documento' },
            cardholderEmail: { id: 'form-checkout__cardholderEmail', placeholder: 'E-mail' },
          },
          callbacks: {
            onFormMounted: (error: any) => {
              this.loading = false;
              if (error) {
                console.warn('Error montando formulario:', error);
                return;
              }
              console.log('✅ Formulario montado');
            },
            onSubmit: (event: Event) => {
              event.preventDefault();
              const formData = this.cardForm.getCardFormData();
              this.sendPayment(formData);
            },
            onFetching: (resource: string) => {
              console.log('📡 Fetching:', resource);
              return () => {
                this.loading = false;
              };
            },
          },
        });
      }, 0);
    }
  

  volverAPagos() {
    this.router.navigate(['/user/historial-pedidos']); // Cambia la ruta según tu app
  }
}
