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
  serieEditando: any = {};
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productoSerieService: ProductoSerieService,
    private productoService: ProductoService,
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
    if (this.serieEditando.fechaVencimiento) {
      const fecha = new Date(this.serieEditando.fechaVencimiento);
      this.serieEditando.fechaVencimiento = fecha.toISOString().split('T')[0];
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
    }

    const serieData: any = {
      numeroSerie: this.nuevaSerie.numeroSerie.trim(),
      observaciones: this.nuevaSerie.observaciones,
      cantidad: 1, // Serie individual siempre es 1
      producto: { productoId: this.productoId }
    };

    if (this.nuevaSerie.fechaVencimiento) {
      serieData.fechaVencimiento = new Date(this.nuevaSerie.fechaVencimiento);
    }

    this.productoSerieService.agregarProductoSerie(serieData).subscribe(
      (response) => {        this.snack.open('Número de serie agregado correctamente', '', {
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
    }

    const lote = {
      numeroSerie: this.loteData.numeroSerie,
      producto: { productoId: this.productoId },
      cantidad: this.loteData.cantidad,
      fechaVencimiento: this.loteData.fechaVencimiento ? new Date(this.loteData.fechaVencimiento) : null,
      observaciones: this.loteData.observaciones || ''
    };

    this.productoSerieService.agregarProductoSerie(lote).subscribe(
      (response) => {        this.snack.open(`Se creó el lote con cantidad ${this.loteData.cantidad}`, '', {
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
    const serieData: any = {
      numeroSerie: this.serieEditando.numeroSerie,
      observaciones: this.serieEditando.observaciones,
      estado: this.serieEditando.estado,
      producto: { productoId: this.productoId }
    };

    if (this.serieEditando.fechaVencimiento) {
      serieData.fechaVencimiento = new Date(this.serieEditando.fechaVencimiento);
    }

    this.productoSerieService.actualizarProductoSerie(this.serieEditando.productoSerieId, serieData).subscribe(
      (response) => {
        this.snack.open('Número de serie actualizado correctamente', '', {
          duration: 3000
        });
        this.cerrarModalEditar();
        this.cargarSeries();
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
    if (confirm(`¿Está seguro de eliminar el número de serie ${serie.numeroSerie}?`)) {
      this.productoSerieService.eliminarProductoSerie(serie.productoSerieId).subscribe(
        (response) => {          this.snack.open('Número de serie eliminado correctamente', '', {
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
  }

  // Métodos auxiliares para el template
  getSeriesVendidas(): number {
    return this.series.filter(s => s.estado === 'VENDIDO').length;
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
