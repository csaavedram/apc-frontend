import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import baserUrl from './helper';

@Injectable({
  providedIn: 'root',
})
export class FacturaDetailsService {
  constructor(private http: HttpClient) {}

  public agregarFacturaDetail(facturaDetail: any): Observable<any> {
    return this.http.post(`${baserUrl}/facturadetails/`, facturaDetail);
  }

  public agregarFacturaDetailConSeries(facturaDetail: any, numerosSerie: string[]): Observable<any> {
    return this.http.post(`${baserUrl}/facturadetails/con-series`, {
      facturaDetalle: facturaDetail,
      numerosSerie: numerosSerie
    });
  }

  public listarFacturaDetail(facturaDetailsId: number): Observable<any> {
    return this.http.get(`${baserUrl}/facturadetails/${facturaDetailsId}`);
  }

  public listarFacturaDetailConSeries(facturaDetailsId: number): Observable<any> {
    return this.http.get(`${baserUrl}/facturadetails/${facturaDetailsId}/con-series`);
  }

  public listarFacturaDetailsPorFactura(facturaId: number): Observable<any> {
    return this.http.get(`${baserUrl}/facturadetails/factura/${facturaId}`);
  }

  public listarFacturaDetailsPorFacturaConSeries(facturaId: number): Observable<any> {
    return this.http.get(`${baserUrl}/facturadetails/factura/${facturaId}/con-series`);
  }

  public liberarSeriesDeFacturaDetalle(facturaDetailsId: number): Observable<any> {
    return this.http.delete(`${baserUrl}/facturadetails/${facturaDetailsId}/liberar-series`);
  }

  public listarFacturaDetailsAll(){
    return this.http.get(`${baserUrl}/facturadetails/`);
  }
}
