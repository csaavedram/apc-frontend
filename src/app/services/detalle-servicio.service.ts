import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import baserUrl from './helper';

@Injectable({
  providedIn: 'root'
})
export class DetalleServicioService {

  constructor(private httpClient: HttpClient) { }

  public listarDetalleServicios(): Observable<any> {
    return this.httpClient.get(`${baserUrl}/detalle-servicios/`);
  }
  public agregarDetalleServicio(detalleServicio: any): Observable<any> {
    return this.httpClient.post(`${baserUrl}/detalle-servicios/`, detalleServicio);
  }

  public agregarDetalleServicioSimple(servicioId: any, detalleServicio: any): Observable<any> {
    return this.httpClient.post(`${baserUrl}/detalle-servicios/servicio/${servicioId}`, detalleServicio);
  }

  public obtenerDetalleServicio(detalleServicioId: any): Observable<any> {
    return this.httpClient.get(`${baserUrl}/detalle-servicios/${detalleServicioId}`);
  }
  public actualizarDetalleServicio(detalleServicioId: any, detalleServicio: any): Observable<any> {
    return this.httpClient.put(`${baserUrl}/detalle-servicios/${detalleServicioId}`, detalleServicio);
  }

  public actualizarDetalleServicioSimple(detalleServicioId: any, servicioId: any, detalleServicio: any): Observable<any> {
    return this.httpClient.put(`${baserUrl}/detalle-servicios/${detalleServicioId}/servicio/${servicioId}`, detalleServicio);
  }

  public eliminarDetalleServicio(detalleServicioId: any): Observable<any> {
    return this.httpClient.delete(`${baserUrl}/detalle-servicios/${detalleServicioId}`);
  }

  public obtenerDetalleServiciosPorServicioId(servicioId: any): Observable<any> {
    return this.httpClient.get(`${baserUrl}/detalle-servicios/servicio/${servicioId}`);
  }

  public obtenerDetalleServiciosPorSku(sku: string): Observable<any> {
    return this.httpClient.get(`${baserUrl}/detalle-servicios/sku/${sku}`);
  }

  public obtenerDetalleServiciosPorNumeroSerie(numeroSerie: string): Observable<any> {
    return this.httpClient.get(`${baserUrl}/detalle-servicios/numero-serie/${numeroSerie}`);
  }
}
