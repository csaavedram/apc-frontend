import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import baserUrl from './helper';

@Injectable({
  providedIn: 'root'
})
export class FacturaService {

  constructor(private http: HttpClient) { }

  public agregarFactura(factura: any) {
    return this.http.post(`${baserUrl}/factura/`, factura);
  }

  public listarFacturas() {
    return this.http.get(`${baserUrl}/factura/`);
  }

  public obtenerFactura(facturaId: any) {
    return this.http.get(`${baserUrl}/factura/${facturaId}`);
  }

  public listarFacturasPorUsuario(userId: any) {
    return this.http.get(`${baserUrl}/factura/user/${userId}`);
  }
}
