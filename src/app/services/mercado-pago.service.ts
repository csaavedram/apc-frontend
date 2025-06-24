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

    console.log('🔑 Inicializando MercadoPago con Public Key:', publicKey);

    // Limpiar cualquier instancia anterior más agresivamente
    const oldScript = document.getElementById('mp-sdk');
    if (oldScript) {
      oldScript.remove();
      delete window.MercadoPago;
    }

    // Limpiar cache del navegador para el SDK
    const allScripts = document.querySelectorAll('script[src*="mercadopago"]');
    allScripts.forEach(script => script.remove());

    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.id = 'mp-sdk';
      script.src = 'https://sdk.mercadopago.com/js/v2?_t=' + Date.now(); // Cache busting
      script.onload = () => {
        console.log('✅ SDK de MercadoPago cargado exitosamente');
        resolve();
      };
      script.onerror = () => {
        console.error('❌ Error cargando SDK de MercadoPago');
        reject('Fallo al cargar MercadoPago SDK');
      };
      document.body.appendChild(script);
    });

    const mp = new window.MercadoPago(publicKey, { locale });
    console.log('✅ MercadoPago inicializado con locale:', locale);
    return mp;
  }

  createPayment(paymentData: any) {
    return this.http.post(`${baserUrl}/payments/`, paymentData);
  }
}
