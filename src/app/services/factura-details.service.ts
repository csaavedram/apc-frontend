import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import baserUrl from './helper';

@Injectable({
  providedIn: 'root',
})
export class FacturaDetailsService {
  constructor(private http: HttpClient) {}

  public agregarFacturaDetail(facturaDetail: any) {
    return this.http.post(`${baserUrl}/facturadetails/`, facturaDetail);
  }

  public listarFacturaDetail(facturaDetailsId: number) {
    return this.http.get(`${baserUrl}/facturadetails/${facturaDetailsId}`);
  }
  public listarFacturaDetailsPorFactura(facturaId: number) {
    return this.http.get(`${baserUrl}/facturadetails/factura/${facturaId}`);
  }  
  // Buscar facturas por número de serie/lote
  public buscarFacturasPorNumeroSerie(numeroSerie: string): Observable<any> {
    return this.http.get(`${baserUrl}/facturadetails/buscar-por-serie/${numeroSerie}`);
  }  // Buscar detalles de factura que contengan un número de serie específico
  public buscarPorNumeroSerie(numeroSerie: string): Observable<any[]> {
    return this.http.get<any[]>(`${baserUrl}/facturadetails/serie/${numeroSerie}`);
  }

  // Buscar garantía - endpoint simple
  public buscarGarantia(numeroSerie: string): Observable<any> {
    return this.http.get(`${baserUrl}/facturadetails/garantia/${numeroSerie}`);
  }
}
