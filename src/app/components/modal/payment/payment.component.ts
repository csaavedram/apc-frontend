import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { PaymentService } from '../../../services/mercado-pago.service';
import { PaymentTermService } from 'src/app/services/payment-term.service';
import { FacturaService } from 'src/app/services/factura.service';
import { FacturaDetailsService } from 'src/app/services/facturadetails.service';
import { LoginService } from 'src/app/services/login.service';
import { MatDialogRef } from '@angular/material/dialog';
import { OrdersService } from 'src/app/services/orders.service';

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
  user: any = null;

  loading = false;

  constructor(
    private dialogRef: MatDialogRef<PaymentComponent>,
    private paymentService: PaymentService,
    private facturaService: FacturaService,
    private facturaDetailsService: FacturaDetailsService,
    private paymentTermService: PaymentTermService,
    private loginService: LoginService,
    private ordersService: OrdersService // Inject OrdersService
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

  closeModel() {
    this.dialogRef.close();
  }

  sendPayment(data: any) {
    const installments = Number(data.installments);
    const totalAmount = Number(data.amount);

    const payload = {
      token: data.token,
      issuer_id: data.issuerId,
      payment_method_id: data.paymentMethodId,
      transaction_amount: totalAmount,
      installments: installments,
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
      (mpResponse: any) => {
        console.log('✅ Pago exitoso MP:', mpResponse);

        const facturaPayload = {
          divisa: 'Soles',
          tipoPago: installments > 1 ? 'Credito' : 'Contado',
          total: totalAmount,
          user: { id: this.user.id },
          fechaEmision: new Date(),
          estado: "Creado"
        };

        this.facturaService.agregarFactura(facturaPayload).subscribe(
          (facturaResp: any) => {
            const orderId = facturaResp.orderId;
            this.ordersService.cambiarEstadoOrder(orderId).subscribe(
              () => {
                console.log('✅ Estado de la orden actualizado a "Pagado"');
                this.closeModel();
              },
              (err: any) => {
                console.error('❌ Error al cambiar el estado de la orden:', err);
              }
            );
          },
          (err: any) => {
            console.error('❌ Error creando factura:', err);
          }
        );
      },
      (error: any) => {
        console.error('❌ Error en el pago MP:', error);
      }
    );
  }

}
