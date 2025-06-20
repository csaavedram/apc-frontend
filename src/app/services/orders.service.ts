import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import baserUrl from './helper';

@Injectable({
  providedIn: 'root'
})
export class OrdersService {

  constructor(private http:HttpClient) { }

  public listarOrders(){
    return this.http.get(`${baserUrl}/orders/`);
  }

  public agregarOrder(order:any){
    return this.http.post(`${baserUrl}/orders/`, order);
  }

  public eliminarOrder(orderId:any){
    return this.http.delete(`${baserUrl}/orders/${orderId}`);
  }

  public obtenerOrder(orderId:any){
    return this.http.get(`${baserUrl}/orders/${orderId}`);
  }

  public actualizarOrder(order:any){
    return this.http.put(`${baserUrl}/orders/`, order);
  }

  public listarOrdersByUser(userId:any){
    return this.http.get(`${baserUrl}/orders/user/${userId}`);
  }

  public pagarOrder(orderId: number) {
    return this.http.patch(`${baserUrl}/orders/pagar/${orderId}`, null);
  }

  public pagarParcialmenteOrder(orderId: number) {
    return this.http.patch(`${baserUrl}/orders/pagar-parcialmente/${orderId}`, null);
  }

  public atenderOrder(orderId: number, data: any) {
    return this.http.patch(`${baserUrl}/orders/atender/${orderId}`, data);
  }

  public rechazarOrder(orderId: number) {
    return this.http.patch(`${baserUrl}/orders/rechazar/${orderId}`, null);
  }

  public aceptarOrder(orderId: number) {
    return this.http.patch(`${baserUrl}/orders/aceptar/${orderId}`, null);
  }
}
