import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import baserUrl from './helper';

@Injectable({
  providedIn: 'root'
})
export class NotaCreditoDetailsService {

  constructor(private http: HttpClient) { }

  public agregarNotaCreditoDetail(notaCreditoDetail: any) {
    return this.http.post(`${baserUrl}/notacreditodetails/`, notaCreditoDetail);
  }

  public listarNotasCreditoDetail(notaCreditoDetailId: number) {
    return this.http.get(`${baserUrl}/notacreditodetails/${notaCreditoDetailId}`);
  }

  public listarNotasCreditoDetailsPorNotaCredito(notaCreditoId: number) {
    return this.http.get(`${baserUrl}/notacreditodetails/notacredito/${notaCreditoId}`);
  }
}
