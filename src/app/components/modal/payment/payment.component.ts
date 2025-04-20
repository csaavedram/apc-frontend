import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { PaymentService } from '../../../services/mercado-pago.service';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.css',
})
export class PaymentComponent implements OnInit {
  private mp: any;
  private cardForm: any;

  loading = false;
  shouldRenderForm = true;

  constructor(
    private paymentService: PaymentService,
  ) {}

  async ngOnInit() {
    setTimeout(async () => {
      this.loading = true;
      this.mp = await this.paymentService.initializeMercadoPago();

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

  sendPayment(data: any) {
    const payload = {
      token: data.token,
      issuer_id: data.issuerId,
      payment_method_id: data.paymentMethodId,
      transaction_amount: Number(data.amount),
      installments: Number(data.installments),
      description: 'Pago aprobado',
      payer: {
        email: data.cardholderEmail,
        identification: {
          type: data.identificationType,
          number: data.identificationNumber,
        },
      },
    };

    this.paymentService.createPayment(payload).subscribe(
      (data: any) => {
        console.log('✅ Pago exitoso:', data);
        this.cardForm.clear();
      },
      (error: any) => {
        console.error('❌ Error en el pago:', error);
        this.cardForm.clear();
      }
    );
  }
}
