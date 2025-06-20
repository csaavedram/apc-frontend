import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import baserUrl from './helper';

@Injectable({
  providedIn: 'root'
})
export class NotaCreditoService {

  constructor(private http: HttpClient) { }

  public agregarNotaCredito(notaCredito: any) {
    return this.http.post(`${baserUrl}/notacredito/`, notaCredito);
  }

  public listarNotasCredito() {
    return this.http.get(`${baserUrl}/notacredito/`);
  }

  public obtenerNotaCredito(notaCreditoId: any) {
    return this.http.get(`${baserUrl}/notacredito/${notaCreditoId}`);
  }

  public listarNotaCreditoPorCodigoFactura(codigo: string) {
    return this.http.get(`${baserUrl}/notacredito/factura/codigo/${codigo}`);
  }
}
