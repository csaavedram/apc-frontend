import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import baserUrl from './helper';

@Injectable({
  providedIn: 'root',
})
export class PaymentTermService {
  constructor(private http: HttpClient) {}

  public agregarPlazoPago(paymentTerm: any) {
    return this.http.post(`${baserUrl}/paymentterms/`, paymentTerm);
  }

  public obtenerPlazosPagoPorFactura(facturaId: any) {
    return this.http.get(`${baserUrl}/paymentterms/factura/${facturaId}`);
  }
}
