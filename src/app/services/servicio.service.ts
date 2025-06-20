import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import baserUrl from './helper';

@Injectable({
  providedIn: 'root'
})
export class ServicioService {

  constructor(private http:HttpClient) { }

  public listarServicios(){
    return this.http.get(`${baserUrl}/servicios/`);
  }

  public agregarServicio(servicio:any){
    return this.http.post(`${baserUrl}/servicios/`, servicio);
  }
  
  public eliminarServicio(servicioId:any){
    return this.http.delete(`${baserUrl}/servicios/${servicioId}`);
  }

  public obtenerServicio(servicioId:any){
    return this.http.get(`${baserUrl}/servicios/${servicioId}`);
  }
    public actualizarServicio(servicio:any){
    return this.http.put(`${baserUrl}/servicios/`, servicio);
  }

  public obtenerServicioConDetalles(servicioId: any) {
    return this.http.get(`${baserUrl}/servicios/${servicioId}/con-detalles`);
  }
}