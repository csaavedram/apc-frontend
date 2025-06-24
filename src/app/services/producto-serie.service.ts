import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import baserUrl from './helper';

@Injectable({
  providedIn: 'root'
})
export class ProductoSerieService {

  constructor(private httpClient: HttpClient) { }

  // CRUD básico
  public agregarProductoSerie(productoSerie: any): Observable<any> {
    return this.httpClient.post(`${baserUrl}/producto-serie/`, productoSerie);
  }

  public listarProductosSerie(): Observable<any> {
    return this.httpClient.get(`${baserUrl}/producto-serie/`);
  }

  public obtenerProductoSerie(productoSerieId: any): Observable<any> {
    return this.httpClient.get(`${baserUrl}/producto-serie/${productoSerieId}`);
  }

  public actualizarProductoSerie(productoSerieId: any, productoSerie: any): Observable<any> {
    return this.httpClient.put(`${baserUrl}/producto-serie/${productoSerieId}`, productoSerie);
  }

  public eliminarProductoSerie(productoSerieId: any): Observable<any> {
    return this.httpClient.delete(`${baserUrl}/producto-serie/${productoSerieId}`);
  }

  // Consultas específicas
  public buscarPorNumeroSerie(numeroSerie: string): Observable<any> {
    return this.httpClient.get(`${baserUrl}/producto-serie/numero-serie/${numeroSerie}`);
  }

  public obtenerSeriesPorProducto(productoId: any): Observable<any> {
    return this.httpClient.get(`${baserUrl}/producto-serie/producto/${productoId}`);
  }

  public obtenerSeriesDisponibles(productoId: any): Observable<any> {
    return this.httpClient.get(`${baserUrl}/producto-serie/producto/${productoId}/disponibles`);
  }

  public contarSeriesDisponibles(productoId: any): Observable<any> {
    return this.httpClient.get(`${baserUrl}/producto-serie/producto/${productoId}/contar-disponibles`);
  }

  // Validaciones
  public validarNumeroSerie(numeroSerie: string): Observable<any> {
    return this.httpClient.get(`${baserUrl}/producto-serie/validar-numero-serie/${numeroSerie}`);
  }

  public validarDisponibilidad(productoId: any, cantidad: number): Observable<any> {
    return this.httpClient.post(`${baserUrl}/producto-serie/producto/${productoId}/validar-disponibilidad`, 
      { cantidad: cantidad });
  }

  // Operaciones masivas
  public crearSeriesEnLote(productoId: any, numerosSerie: string[], fechaVencimiento?: Date): Observable<any> {
    const body: any = { numerosSerie: numerosSerie };
    if (fechaVencimiento) {
      body.fechaVencimiento = fechaVencimiento.getTime();
    }
    return this.httpClient.post(`${baserUrl}/producto-serie/producto/${productoId}/crear-lote`, body);
  }

  // Gestión de vencimientos
  public obtenerSeriesProximasAVencer(): Observable<any> {
    return this.httpClient.get(`${baserUrl}/producto-serie/proximas-a-vencer`);
  }

  public marcarSeriesVencidas(): Observable<any> {
    return this.httpClient.post(`${baserUrl}/producto-serie/marcar-vencidas`, {});
  }
  
  // Métodos para procesar ventas
  public procesarVentaProducto(productoId: any, cantidad: number): Observable<any> {
    return this.httpClient.post(`${baserUrl}/producto-serie/producto/${productoId}/procesar-venta`, 
      { cantidad: cantidad });
  }
  
  public procesarVentaMultiple(productos: any[]): Observable<any> {
    return this.httpClient.post(`${baserUrl}/producto-serie/procesar-venta-multiple`, productos);
  }
}
