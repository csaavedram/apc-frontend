import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import baserUrl from './helper';

@Injectable({
  providedIn: 'root'
})
export class QuotationDetailsService {

  constructor(private http:HttpClient) { }

  public listarQuotationDetails(){
    return this.http.get(`${baserUrl}/quotationdetails/`);
  }

  public agregarQuotationDetail(quotationdetails:any){
    return this.http.post(`${baserUrl}/quotationdetails/`, quotationdetails);
  }

  public eliminarQuotationDetail(quotationdetailsId:any){
    return this.http.delete(`${baserUrl}/quotationdetails/${quotationdetailsId}`);
  }

  public obtenerQuotationDetail(quotationdetailsId:any){
    return this.http.get(`${baserUrl}/quotationdetails/${quotationdetailsId}`);
  }

  public actualizarQuotationDetail(quotationdetails:any){
    return this.http.put(`${baserUrl}/quotationdetails/`, quotationdetails);
  }

  public listarQuotationsDetailsByQuotation(quotationId:any){
    return this.http.get(`${baserUrl}/quotationdetails/quotation/${quotationId}`);
  }

}
