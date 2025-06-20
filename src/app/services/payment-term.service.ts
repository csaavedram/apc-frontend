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

  public actualizarFacturaDePlazoPago(plazoPagoId: any, data: any) {
    return this.http.patch(`${baserUrl}/plazospago/${plazoPagoId}`, data);
  }

  public actualizarNotaCreditoEnPlazoPago(plazoPagoId: any, data: any) {
    return this.http.patch(`${baserUrl}/plazospago/${plazoPagoId}/notaCredito`, data);
  }

  public actualizarPlazoPago(data: any) {
    return this.http.put(`${baserUrl}/plazospago/`, data);
  }

  public eliminarPlazoPago(plazoPagoId: any) {
    return this.http.delete(`${baserUrl}/plazospago/${plazoPagoId}`);
  }

  public obtenerPlazosPagoPorNotaCredito(notaCreditoId: any) {
    return this.http.get(`${baserUrl}/plazospago/notaCredito/${notaCreditoId}`);
  }

  public cambiarEstadoAPagado(plazoPagoId: any) {
    return this.http.patch(`${baserUrl}/plazospago/${plazoPagoId}/estado/pagado`, null);
  }
}
