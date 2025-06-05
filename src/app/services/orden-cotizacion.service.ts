import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import baserUrl from './helper';

@Injectable({
  providedIn: 'root'
})
export class OrdenCotizacionService {
  constructor(private http: HttpClient) {}

  public agregarOrdenCotizacion(ordenCotizacion: any) {
    return this.http.post(`${baserUrl}/ordencotizacion/`, ordenCotizacion);
  }

  public obtenerOrdenCotizacionPorOrderId(orderId: number) {
    return this.http.get(`${baserUrl}/ordencotizacion/order/${orderId}`);
  }

  public obtenerOrdenCotizacionPorCotizacionId(cotizacionId: number) {
    return this.http.get(`${baserUrl}/ordencotizacion/cotizacion/${cotizacionId}`);
  }
}
