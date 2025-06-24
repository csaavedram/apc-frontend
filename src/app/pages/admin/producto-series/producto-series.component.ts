import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductoSerieService } from '../../../services/producto-serie.service';
import { ProductoService } from '../../../services/producto.service';
import { InventarioService } from '../../../services/inventario.service';

@Component({
  selector: 'app-producto-series',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatTableModule,
    MatPaginatorModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './producto-series.component.html',
  styleUrl: './producto-series.component.css'
})
export class ProductoSeriesComponent implements OnInit {

  productoId: any = 0;
  producto: any = {};
  series: any[] = [];
  seriesDisponibles: any[] = [];
    // Modal para agregar serie individual
  showAgregarModal = false;
  nuevaSerie = {
    numeroSerie: '',
    fechaVencimiento: '',
    observaciones: '',
    cantidad: 1
  };

  // Modal para agregar lote (con cantidad específica)
  showLoteModal = false;
  loteData = {
    numeroSerie: '',
    fechaVencimiento: '',
    cantidad: 1,
    observaciones: ''
  };

  // Modal para editar serie
  showEditarModal = false;
  serieEditando: any = {};  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productoSerieService: ProductoSerieService,
    private productoService: ProductoService,
    private inventarioService: InventarioService,
    private snack: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.productoId = this.route.snapshot.params['productoId'];
    this.cargarProducto();
    this.cargarSeries();
  }  cargarProducto(): void {
    this.productoService.obtenerProducto(this.productoId).subscribe(      (data: any) => {
        this.producto = data;
      },
      (error) => {
        console.log(error);
        this.snack.open('Error al cargar el producto', '', {
          duration: 3000
        });
      }
    );
  }

  cargarSeries(): void {
    this.productoSerieService.obtenerSeriesPorProducto(this.productoId).subscribe(
      (data: any) => {
        this.series = data;
        this.seriesDisponibles = data.filter((serie: any) => serie.estado === 'DISPONIBLE');
      },
      (error) => {
        console.log(error);
      }
    );
  }
  // Gestión de modales
  abrirModalAgregar(): void {
    this.nuevaSerie = {
      numeroSerie: '',
      fechaVencimiento: '',
      observaciones: '',
      cantidad: 1
    };
    this.showAgregarModal = true;
  }

  cerrarModalAgregar(): void {
    this.showAgregarModal = false;
  }

  abrirModalLote(): void {
    this.loteData = {
      numeroSerie: '',
      fechaVencimiento: '',
      cantidad: 1,
      observaciones: ''
    };
    this.showLoteModal = true;
  }

  cerrarModalLote(): void {
    this.showLoteModal = false;
  }

  editarSerie(serie: any): void {
    this.serieEditando = { ...serie };
    // Asegurarse que la cantidad esté presente y sea editable
    if (typeof this.serieEditando.cantidad === 'undefined' || this.serieEditando.cantidad === null) {
      this.serieEditando.cantidad = 1;
    }
    // Corregir formato de fecha para input type="date"
    if (this.serieEditando.fechaVencimiento) {
      // Si ya es formato yyyy-MM-dd, dejar igual
      const fecha = new Date(this.serieEditando.fechaVencimiento);
      const yyyy = fecha.getFullYear();
      const mm = (fecha.getMonth() + 1).toString().padStart(2, '0');
      const dd = fecha.getDate().toString().padStart(2, '0');
      this.serieEditando.fechaVencimiento = `${yyyy}-${mm}-${dd}`;
    } else {
      this.serieEditando.fechaVencimiento = '';
    }
    this.showEditarModal = true;
  }

  cerrarModalEditar(): void {
    this.showEditarModal = false;
  }
  // Operaciones CRUD
  agregarSerie(): void {
    if (!this.nuevaSerie.numeroSerie.trim()) {
      this.snack.open('El número de serie es obligatorio', '', {
        duration: 3000
      });
      return;
    }    const serieData: any = {
      numeroSerie: this.nuevaSerie.numeroSerie.trim(),
      observaciones: this.nuevaSerie.observaciones,
      cantidad: 1, // Serie individual siempre es 1
      cantidadOriginal: 1, // Inicializar cantidadOriginal para nuevas series
      cantidadVendida: 0, // Inicializar cantidadVendida en 0
      producto: { productoId: this.productoId }
    };

    if (this.nuevaSerie.fechaVencimiento) {
      serieData.fechaVencimiento = new Date(this.nuevaSerie.fechaVencimiento);
    }    this.productoSerieService.agregarProductoSerie(serieData).subscribe(
      (response) => {        // Registrar movimiento de inventario
        this.registrarMovimientoInventario(
          1, 
          'Ingreso', 
          `Serie individual agregada: ${this.nuevaSerie.numeroSerie}`,
          this.nuevaSerie.numeroSerie
        );
        
        this.snack.open('Número de serie agregado correctamente', '', {
          duration: 3000
        });
        this.cerrarModalAgregar();
        this.cargarSeries();
        this.cargarProducto(); // Recargar producto para actualizar stock
      },
      (error) => {
        console.log(error);
        this.snack.open('Error al agregar el número de serie. Puede que ya exista.', '', {
          duration: 3000
        });
      }
    );
  }  agregarSeriesLote(): void {
    if (!this.loteData.numeroSerie.trim()) {
      this.snack.open('Debe ingresar un número de lote', '', {
        duration: 3000
      });
      return;
    }

    if (!this.loteData.cantidad || this.loteData.cantidad < 2) {
      this.snack.open('La cantidad del lote debe ser mayor a 1', '', {
        duration: 3000
      });
      return;
    }    const lote = {
      numeroSerie: this.loteData.numeroSerie,
      producto: { productoId: this.productoId },
      cantidad: this.loteData.cantidad,
      cantidadOriginal: this.loteData.cantidad, // Inicializar cantidadOriginal para nuevos lotes
      cantidadVendida: 0, // Inicializar cantidadVendida en 0
      fechaVencimiento: this.loteData.fechaVencimiento ? new Date(this.loteData.fechaVencimiento) : null,
      observaciones: this.loteData.observaciones || ''
    };this.productoSerieService.agregarProductoSerie(lote).subscribe(
      (response) => {        // Registrar movimiento de inventario
        this.registrarMovimientoInventario(
          this.loteData.cantidad, 
          'Ingreso', 
          `Lote agregado: ${this.loteData.numeroSerie} (${this.loteData.cantidad} unidades)`,
          this.loteData.numeroSerie
        );
        
        this.snack.open(`Se creó el lote con cantidad ${this.loteData.cantidad}`, '', {
          duration: 3000
        });
        this.cargarSeries();
        this.cargarProducto(); // Recargar producto para actualizar stock
        this.cerrarModalLote();
      },
      (error) => {
        console.log(error);
        this.snack.open('Error al crear el lote', '', {
          duration: 3000
        });
      }
    );
  }
  actualizarSerie(): void {
    // Encontrar la serie original para comparar la cantidad
    const serieOriginal = this.series.find(s => s.productoSerieId === this.serieEditando.productoSerieId);
    const cantidadOriginal = serieOriginal ? serieOriginal.cantidad : 0;
    const nuevaCantidad = this.serieEditando.cantidad;
    const diferenciaCantidad = nuevaCantidad - cantidadOriginal;

    const serieData: any = {
      numeroSerie: this.serieEditando.numeroSerie,
      observaciones: this.serieEditando.observaciones,
      estado: this.serieEditando.estado,
      cantidad: this.serieEditando.cantidad,
      producto: { productoId: this.productoId }
    };

    // Enviar fecha en formato yyyy-MM-dd solo si está definida y no vacía
    if (this.serieEditando.fechaVencimiento && this.serieEditando.fechaVencimiento !== '') {
      serieData.fechaVencimiento = this.serieEditando.fechaVencimiento;
    }

    this.productoSerieService.actualizarProductoSerie(this.serieEditando.productoSerieId, serieData).subscribe(
      (response) => {        // Registrar movimiento de inventario solo si la cantidad cambió
        if (diferenciaCantidad !== 0) {
          const tipoMovimiento = diferenciaCantidad > 0 ? 'Ingreso' : 'Salida';
          const cantidadMovimiento = Math.abs(diferenciaCantidad);
          const descripcion = `Ajuste de cantidad en ${this.serieEditando.numeroSerie}: ${cantidadOriginal} → ${nuevaCantidad}`;
          
          this.registrarMovimientoInventario(cantidadMovimiento, tipoMovimiento, descripcion, this.serieEditando.numeroSerie);
        }
        
        this.snack.open('Número de serie actualizado correctamente', '', {
          duration: 3000
        });
        this.cerrarModalEditar();
        this.cargarSeries();
        this.cargarProducto(); // Recargar producto para actualizar stock
      },
      (error) => {
        console.log(error);
        this.snack.open('Error al actualizar el número de serie', '', {
          duration: 3000
        });
      }
    );
  }
  eliminarSerie(serie: any): void {
    if (confirm(`¿Está seguro de eliminar el número de serie ${serie.numeroSerie}?`)) {      this.productoSerieService.eliminarProductoSerie(serie.productoSerieId).subscribe(
        (response) => {          // Registrar movimiento de inventario como salida
          this.registrarMovimientoInventario(
            serie.cantidad, 
            'Salida', 
            `Serie/Lote eliminado: ${serie.numeroSerie} (${serie.cantidad} unidades)`,
            serie.numeroSerie
          );
          
          this.snack.open('Número de serie eliminado correctamente', '', {
            duration: 3000
          });
          this.cargarSeries();
          this.cargarProducto(); // Recargar producto para actualizar stock
        },
        (error) => {
          console.log(error);
          this.snack.open('Error al eliminar el número de serie', '', {
            duration: 3000
          });
        }      );
    }
  }  // Método para registrar movimiento de inventario
  private registrarMovimientoInventario(cantidad: number, tipo: string, descripcion: string, numeroSerie?: string): void {
    const movimientoInventario = {
      producto: { productoId: this.productoId },
      cantidad: cantidad,
      tipo: tipo, // "Ingreso" o "Salida"
      numeroSerie: numeroSerie || null, // Agregar el número de serie
      dateCreated: new Date() // Fecha de creación del movimiento
    };

    this.inventarioService.agregarProductoInventario(movimientoInventario).subscribe(
      (response) => {
        console.log('Movimiento de inventario registrado:', response);
      },
      (error) => {
        console.error('Error al registrar movimiento de inventario:', error);
        // No mostramos error al usuario ya que es un proceso secundario
      }
    );
  }

  // Determina si la serie es un lote (cantidad > 1)
  esLote(serie: any): boolean {
    return serie && Number(serie.cantidad) > 1;
  }
  // Métodos auxiliares para el template
  getSeriesVendidas(): number {
    // Contar el total de unidades vendidas (no solo series completamente agotadas)
    return this.series.reduce((total, serie) => {
      return total + (serie.cantidadVendida || 0);
    }, 0);
  }

  getSeriesCompletamenteVendidas(): number {
    // Contar series que están completamente agotadas
    return this.series.filter(s => s.estado === 'VENDIDO').length;
  }

  getTotalUnidadesDisponibles(): number {
    // Contar el total de unidades disponibles
    return this.series.reduce((total, serie) => {
      if (serie.estado === 'DISPONIBLE') {
        return total + (serie.cantidad || 0);
      }
      return total;
    }, 0);
  }

  getSeriesVencidas(): number {
    return this.series.filter(s => s.estado === 'VENCIDO').length;
  }

  getSeriesDefectuosas(): number {
    return this.series.filter(s => s.estado === 'DEFECTUOSO').length;
  }

  isVencido(fechaVencimiento: Date): boolean {
    if (!fechaVencimiento) return false;
    return new Date(fechaVencimiento) < new Date();
  }

  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'DISPONIBLE': return 'badge-success';
      case 'VENDIDO': return 'badge-primary';
      case 'VENCIDO': return 'badge-danger';
      case 'DEFECTUOSO': return 'badge-warning';
      default: return 'badge-secondary';
    }
  }

  volver(): void {
    this.router.navigate(['/admin/productos']);
  }
}
