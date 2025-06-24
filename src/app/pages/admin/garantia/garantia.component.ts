import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { FacturaDetailsService } from 'src/app/services/factura-details.service';

@Component({
  selector: 'app-garantia',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule
  ],
  templateUrl: './garantia.component.html',
  styleUrls: ['./garantia.component.css']
})
export class GarantiaComponent {
  numeroSerieBusqueda: string = '';
  loading: boolean = false;
  resultadoBusqueda: any = null;
  
  displayedColumns: string[] = ['campo', 'valor'];

  constructor(
    private facturaDetailsService: FacturaDetailsService,
    private snack: MatSnackBar,
    private router: Router
  ) {}  buscarGarantia() {
    if (!this.numeroSerieBusqueda || this.numeroSerieBusqueda.trim() === '') {
      this.snack.open('Por favor ingrese un número de serie/lote', 'Cerrar', {
        duration: 3000
      });
      return;
    }

    // Limpiar estado anterior
    this.loading = true;
    this.resultadoBusqueda = null;

    const numeroSerieLimpio = this.numeroSerieBusqueda.trim();
    console.log('🔍 Buscando garantía para:', numeroSerieLimpio);

    // Usar el endpoint simple de garantía
    this.facturaDetailsService.buscarGarantia(numeroSerieLimpio).subscribe({
      next: (respuesta: any) => {
        console.log('✅ Respuesta de garantía:', respuesta);
        
        // Validar respuesta
        if (!respuesta) {
          console.error('❌ Respuesta vacía del servidor');
          this.mostrarError('Error: respuesta vacía del servidor');
          return;
        }
        
        if (respuesta.encontrado) {
          this.resultadoBusqueda = {
            numeroSerie: numeroSerieLimpio,
            facturaId: respuesta.facturaId,
            codigoFactura: respuesta.codigoFactura || 'N/A',
            fechaEmision: respuesta.fechaEmision,
            clienteNombre: respuesta.clienteNombre || 'N/A',
            clienteRucDni: respuesta.clienteRucDni || 'N/A',
            productoNombre: respuesta.productoNombre || 'N/A',
            cantidad: respuesta.cantidad || 0,
            precioTotal: respuesta.precioTotal || 0,
            garantiaValida: this.validarGarantia(respuesta.fechaEmision)
          };
          
          console.log('✅ Resultado procesado:', this.resultadoBusqueda);
        } else {
          this.mostrarError(respuesta.mensaje || 'No se encontró el número de serie');
        }
        
        this.loading = false;
      },
      error: (error: any) => {
        console.error('❌ Error al buscar garantía:', error);
        this.loading = false;
        
        let mensajeError = 'Error al buscar la garantía';
        if (error.error && error.error.mensaje) {
          mensajeError = error.error.mensaje;
        } else if (error.message) {
          mensajeError = error.message;
        }
        
        this.mostrarError(mensajeError);
      }
    });
  }

  private mostrarError(mensaje: string): void {
    this.snack.open(mensaje, 'Cerrar', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  validarGarantia(fechaVenta: string | Date): boolean {
    if (!fechaVenta) return false;
    
    const fecha = new Date(fechaVenta);
    const hoy = new Date();
    const diferenciaDias = Math.floor((hoy.getTime() - fecha.getTime()) / (1000 * 60 * 60 * 24));
    
    // Garantía válida por 365 días (1 año)
    return diferenciaDias <= 365;
  }

  obtenerDiasGarantiaRestantes(fechaVenta: string | Date): number {
    if (!fechaVenta) return 0;
    
    const fecha = new Date(fechaVenta);
    const hoy = new Date();
    const diferenciaDias = Math.floor((hoy.getTime() - fecha.getTime()) / (1000 * 60 * 60 * 24));
    
    return Math.max(0, 365 - diferenciaDias);  }  verFactura() {
    if (this.resultadoBusqueda && this.resultadoBusqueda.facturaId) {
      this.router.navigate(['/admin/viewfactura', this.resultadoBusqueda.facturaId]);
    }
  }

  limpiarBusqueda() {
    this.numeroSerieBusqueda = '';
    this.resultadoBusqueda = null;
  }
}
