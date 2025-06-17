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
    return this.http.post(`${baserUrl}/plazospago/`, paymentTerm);
  }

  public obtenerPlazosPagoPorFactura(facturaId: any) {
    return this.http.get(`${baserUrl}/plazospago/factura/${facturaId}`);
  }

  public obtenerPlazosPagoPorCotizacion(cotizacionId: any) {
    return this.http.get(`${baserUrl}/plazospago/cotizacion/${cotizacionId}`);
  }

  public actualizarPlazoPago(plazoPagoId: any, data: any) {
    return this.http.patch(`${baserUrl}/plazospago/${plazoPagoId}`, data);
  }
}
