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
}
