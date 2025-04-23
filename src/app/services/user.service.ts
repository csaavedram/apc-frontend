import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import baserUrl from './helper';

@Injectable({
  providedIn: 'root'
})
export class UserService {


    constructor(private httpClient: HttpClient) { }

    public añadirUsuario(user:any){
      return this.httpClient.post(`${baserUrl}/usuarios/`,user);
    }

    public listarUsuarios(){
      return this.httpClient.get(`${baserUrl}/usuarios/`);
    }
    public obtenerUsuario(id:any){
      return this.httpClient.get(`${baserUrl}/usuarios/${id}`);
    }
    public actualizarUsuario(id:any, user: any){
      return this.httpClient.put(`${baserUrl}/usuarios/${id}`, user);
    }

    public obtenerUsuarioPorNumeroDocumento(numeroDocumento: string) {
      return this.httpClient.get(`${baserUrl}/usuarios/documento/${numeroDocumento}`);
    }
}
