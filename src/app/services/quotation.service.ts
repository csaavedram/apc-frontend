import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import baserUrl from './helper';

@Injectable({
  providedIn: 'root'
})
export class QuotationService {

  constructor(private http:HttpClient) { }

  public listarQuotations(){
    return this.http.get(`${baserUrl}/quotation/`);
  }

  public agregarQuotation(quotation:any){
    return this.http.post(`${baserUrl}/quotation/`, quotation);
  }

  public eliminarQuotation(quotationId:any){
    return this.http.delete(`${baserUrl}/quotation/${quotationId}`);
  }

  public obtenerQuotation(quotationId:any){
    return this.http.get(`${baserUrl}/quotation/${quotationId}`);
  }

  public actualizarQuotation(quotation:any){
    return this.http.put(`${baserUrl}/quotation/`, quotation);
  }

  public listarQuotationsByUser(userId:any){
    return this.http.get(`${baserUrl}/quotation/user/${userId}`);
  }

  public anularCotizacion(quotationId: any) {
    return this.http.patch(`${baserUrl}/quotation/anular/${quotationId}`, null);
  }

  public obtenerCotizacionPorCodigo(codigo: string) {
    return this.http.get(`${baserUrl}/quotation/codigo/${codigo}`);
  }
}
