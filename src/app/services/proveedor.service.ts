import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import baserUrl from './helper';

@Injectable({
  providedIn: 'root'
})
export class ProveedorService {

  constructor(private http:HttpClient) { }

  public listarProveedores(){
    return this.http.get(`${baserUrl}/proveedores/`);
  }

  public agregarProveedor(proveedor:any){
    return this.http.post(`${baserUrl}/proveedores/`, proveedor);
  }
  public eliminarProveedor(proveedorId:any){
    return this.http.delete(`${baserUrl}/proveedores/${proveedorId}`);
  }

  public obtenerProveedor(proveedorId:any){
    return this.http.get(`${baserUrl}/proveedores/${proveedorId}`);
  }

  public actualizarProveedor(proveedor:any){
    return this.http.put(`${baserUrl}/proveedores/`, proveedor);
  }

  public obtenerProveedorPorRuc(ruc:any){
    return this.http.get(`${baserUrl}/proveedores/ruc/${ruc}`);
  }

  public obtenerProveedorPorRazonSocial(razonSocial:any){
    return this.http.get(`${baserUrl}/proveedores/razonSocial/${razonSocial}`);
  }
}
