import { Component, OnInit } from '@angular/core';
import { ServicioService } from 'src/app/services/servicio.service';
import { DetalleServicioService } from 'src/app/services/detalle-servicio.service';
import Swal from 'sweetalert2';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'app-view-servicio',
  templateUrl: './view-servicio.component.html',
  styleUrls: ['./view-servicio.component.css']
})
export class ViewServicioComponent implements OnInit {
  servicios: any = [];
  currentPage1 = 1;
  rowsPerPage1 = 10;
  totalPages1 = 0;
  searchTerm1: string = '';

  // Propiedades para el modal de detalles
  showDetallesModal: boolean = false;
  showDetalleModal: boolean = false;
  servicioSeleccionado: any = null;
  detalleServicios: any[] = [];
  modoEdicion: boolean = false;
  detalleForm: any = {
    detalleServicioId: null,
    modeloEquipo: '',
    sku: '',
    numeroSerie: '',
    fechaGarantia: '',
    observacion: ''
  };

  constructor(
    private servicioService: ServicioService,
    private detalleServicioService: DetalleServicioService
  ) {}

  prevPage1(): void {
    if (this.currentPage1 > 1) {
      this.currentPage1--;
    }
  }

  nextPage1(): void {
    if (this.currentPage1 < this.totalPages1) {
      this.currentPage1++;
    }
  }

  calculateTotalPages1(): void {
    this.totalPages1 = Math.ceil(this.filteredProductos().length / this.rowsPerPage1);
    if (this.currentPage1 > this.totalPages1) {
      this.currentPage1 = 1;
    }
  }

  displayedProductos(): any[] {
    const startIndex = (this.currentPage1 - 1) * this.rowsPerPage1;
    const endIndex = startIndex + this.rowsPerPage1;
    return this.filteredProductos().slice(startIndex, endIndex);
  }

  filteredProductos(): any[] {
    return this.servicios.filter((servicio: any) =>
      servicio.nombre.toLowerCase().includes(this.searchTerm1.toLowerCase())
    );
  }

  eliminarServicio(servicioId: any): void {
    Swal.fire({
      title: 'Eliminar Servicio',
      text: '¿Estás seguro de eliminar el servicio de la lista?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.servicioService.eliminarServicio(servicioId).subscribe(
          (data) => {
            this.servicios = this.servicios.filter((servicio: any) => servicio.servicioId !== servicioId);
            Swal.fire('Servicio eliminado', 'El servicio ha sido eliminado de la base de datos', 'success');
            this.calculateTotalPages1();
          },
          (error) => {
            Swal.fire('Error', 'Error al eliminar el servicio de la base de datos', 'error');
          }
        );
      }
    });
  }
  ngOnInit(): void {
    combineLatest([this.servicioService.listarServicios()]).subscribe(
      ([servicios]: [any]) => {
        this.servicios = servicios;
        this.calculateTotalPages1();
      },
      (error) => {
        console.log(error);
        Swal.fire('Error', 'Error al cargar los datos', 'error');
      }
    );
  }

  // Métodos para el modal de detalles
  verDetalles(servicioId: any): void {
    this.servicioService.obtenerServicioConDetalles(servicioId).subscribe(
      (servicio: any) => {
        this.servicioSeleccionado = servicio;
        this.detalleServicios = servicio.detalleServicios || [];
        this.showDetallesModal = true;
      },
      (error) => {
        console.log(error);
        Swal.fire('Error', 'Error al cargar los detalles del servicio', 'error');
      }
    );
  }

  cerrarDetallesModal(): void {
    this.showDetallesModal = false;
    this.servicioSeleccionado = null;
    this.detalleServicios = [];
  }

  agregarDetalle(): void {
    this.modoEdicion = false;
    this.resetDetalleForm();
    this.showDetalleModal = true;
  }
  editarDetalle(detalle: any): void {
    console.log('Editando detalle:', detalle);
    this.modoEdicion = true;
    
    // Manejar la fecha correctamente
    let fechaFormateada = '';
    if (detalle.fechaGarantia) {
      const fecha = new Date(detalle.fechaGarantia);
      // Formato YYYY-MM-DD para input type="date"
      fechaFormateada = fecha.getFullYear() + '-' + 
                       String(fecha.getMonth() + 1).padStart(2, '0') + '-' + 
                       String(fecha.getDate()).padStart(2, '0');
    }
    
    this.detalleForm = {
      detalleServicioId: detalle.detalleServicioId,
      modeloEquipo: detalle.modeloEquipo || '',
      sku: detalle.sku || '',
      numeroSerie: detalle.numeroSerie || '',
      fechaGarantia: fechaFormateada,
      observacion: detalle.observacion || ''
    };
    
    console.log('Formulario cargado:', this.detalleForm);
    this.showDetalleModal = true;
  }

  cerrarDetalleModal(): void {
    this.showDetalleModal = false;
    this.resetDetalleForm();
  }

  resetDetalleForm(): void {
    this.detalleForm = {
      detalleServicioId: null,
      modeloEquipo: '',
      sku: '',
      numeroSerie: '',
      fechaGarantia: '',
      observacion: ''
    };
  }  guardarDetalle(): void {
    console.log('=== GUARDANDO DETALLE ===');
    console.log('Modo edición:', this.modoEdicion);
    console.log('Formulario actual:', this.detalleForm);
    
    if (!this.detalleForm.modeloEquipo || !this.detalleForm.sku || !this.detalleForm.numeroSerie || !this.detalleForm.fechaGarantia) {
      Swal.fire('Error', 'Por favor, complete todos los campos obligatorios', 'error');
      return;
    }

    if (!this.servicioSeleccionado || !this.servicioSeleccionado.servicioId) {
      Swal.fire('Error', 'Error: No se ha seleccionado un servicio válido', 'error');
      return;
    }    const detalleData = {
      modeloEquipo: this.detalleForm.modeloEquipo,
      sku: this.detalleForm.sku,
      numeroSerie: this.detalleForm.numeroSerie,
      fechaGarantia: this.detalleForm.fechaGarantia,
      observacion: this.detalleForm.observacion,
      servicio: { 
        servicioId: this.servicioSeleccionado.servicioId 
      }
    };

    console.log('Datos a enviar:', detalleData); // Para debug

    if (this.modoEdicion && this.detalleForm.detalleServicioId) {
      // Para editar, usar el endpoint simple también
      const detalleDataUpdate = {
        modeloEquipo: this.detalleForm.modeloEquipo.trim(),
        sku: this.detalleForm.sku.trim(),
        numeroSerie: this.detalleForm.numeroSerie.trim(),
        fechaGarantia: this.detalleForm.fechaGarantia,
        observacion: this.detalleForm.observacion ? this.detalleForm.observacion.trim() : ''
      };

      console.log('=== ACTUALIZANDO DETALLE ===');
      console.log('Datos de actualización:', detalleDataUpdate);
      console.log('DetalleServicioId:', this.detalleForm.detalleServicioId);
      console.log('ServicioId:', this.servicioSeleccionado.servicioId);

      this.detalleServicioService.actualizarDetalleServicioSimple(
        this.detalleForm.detalleServicioId, 
        this.servicioSeleccionado.servicioId, 
        detalleDataUpdate
      ).subscribe(
        (response) => {
          console.log('Respuesta exitosa:', response);
          Swal.fire('Éxito', 'Detalle actualizado correctamente', 'success');
          this.cerrarDetalleModal();
          this.verDetalles(this.servicioSeleccionado.servicioId); // Recargar detalles
        },
        (error) => {
          console.log('=== ERROR DE ACTUALIZACIÓN ===');
          console.log('Error completo:', error);
          console.log('Status:', error.status);
          console.log('Error message:', error.error);
          
          let errorMessage = 'Error al actualizar el detalle';
          if (error.status === 400) {
            errorMessage = 'Datos inválidos. Verifique los campos ingresados.';
          } else if (error.status === 404) {
            errorMessage = 'Detalle no encontrado.';
          }
          
          Swal.fire('Error', errorMessage, 'error');
        }
      );
    } else {
      // Para agregar, usar el endpoint más simple
      const detalleDataSimple = {
        modeloEquipo: this.detalleForm.modeloEquipo,
        sku: this.detalleForm.sku,
        numeroSerie: this.detalleForm.numeroSerie,
        fechaGarantia: this.detalleForm.fechaGarantia,
        observacion: this.detalleForm.observacion
      };

      console.log('Datos simples a enviar:', detalleDataSimple);
      console.log('ServicioId:', this.servicioSeleccionado.servicioId);

      this.detalleServicioService.agregarDetalleServicioSimple(this.servicioSeleccionado.servicioId, detalleDataSimple).subscribe(
        (response) => {
          Swal.fire('Éxito', 'Detalle agregado correctamente', 'success');
          this.cerrarDetalleModal();
          this.verDetalles(this.servicioSeleccionado.servicioId); // Recargar detalles
        },
        (error) => {
          console.log('Error completo:', error);
          Swal.fire('Error', 'Error al agregar el detalle', 'error');
        }
      );
    }
  }

  eliminarDetalle(detalleServicioId: any): void {
    Swal.fire({
      title: 'Eliminar Detalle',
      text: '¿Estás seguro de eliminar este detalle?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.detalleServicioService.eliminarDetalleServicio(detalleServicioId).subscribe(
          (data) => {
            Swal.fire('Detalle eliminado', 'El detalle ha sido eliminado correctamente', 'success');
            this.verDetalles(this.servicioSeleccionado.servicioId); // Recargar detalles
          },
          (error) => {
            console.log(error);
            Swal.fire('Error', 'Error al eliminar el detalle', 'error');
          }
        );
      }
    });
  }
}
