import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import baserUrl from './helper';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {

  constructor(private http:HttpClient) { }

  public listarProductos(){
    return this.http.get(`${baserUrl}/productos/`);
  }

  public agregarProducto(producto:any){
    return this.http.post(`${baserUrl}/productos/`, producto);
  }
  
  public eliminarProducto(productoId:any){
    return this.http.delete(`${baserUrl}/productos/${productoId}`);
  }
  
  public obtenerProducto(productoId:any){
    return this.http.get(`${baserUrl}/productos/${productoId}`);
  }
    public actualizarProducto(producto:any){
    return this.http.put(`${baserUrl}/productos/`, producto);
  }

  public restarStock(productoId: any, cantidad: number) {
    return this.http.put(`${baserUrl}/productos/${productoId}/restar-stock`, { cantidad });
  }

  public aumentarStock(productoId: any, cantidad: number) {
    return this.http.put(`${baserUrl}/productos/${productoId}/aumentar-stock`, { cantidad });
  }

}