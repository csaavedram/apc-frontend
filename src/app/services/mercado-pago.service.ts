import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { mpEnvironment } from '../environments/mercado-pago';
import baserUrl from './helper';

declare global {
  interface Window {
    MercadoPago: any;
  }
}

@Injectable({
  providedIn: 'root',
})
export class PaymentService {

  constructor(private http: HttpClient) {}

  async initializeMercadoPago() {
    const publicKey = mpEnvironment.mercadoPagoPublicKey;
    const locale = mpEnvironment.mercadoPagoLocale;

    const oldScript = document.getElementById('mp-sdk');
    if (oldScript) {
      oldScript.remove();
      delete window.MercadoPago;
    }

    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.id = 'mp-sdk';
      script.src = 'https://sdk.mercadopago.com/js/v2';
      script.onload = () => resolve();
      script.onerror = () => reject('Fallo al cargar MercadoPago SDK');
      document.body.appendChild(script);
    });

    const mp = new window.MercadoPago(publicKey, { locale });
    return mp;
  }

  createPayment(paymentData: any) {
    return this.http.post(`${baserUrl}/payments/`, paymentData);
  }
}
