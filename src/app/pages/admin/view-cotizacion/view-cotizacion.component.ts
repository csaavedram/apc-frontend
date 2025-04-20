import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { PdfService } from 'src/app/services/pdf.service';
import { QuotationService } from 'src/app/services/quotation.service';
import { convertirFechaISOaDate } from '../../../utils'
import Swal from 'sweetalert2';

@Component({
  selector: 'app-view-cotizacion',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    FormsModule,
    RouterModule,
    MatButton,
  ],
  templateUrl: './view-cotizacion.component.html',
  styleUrl: './view-cotizacion.component.css'
})
export class ViewCotizacionComponent implements OnInit {
  cotizaciones: any = [];
  currentPage1 = 1;
  rowsPerPage1 = 10;
  totalPages1 = 0;
  searchTerm1: string = '';

  constructor(
    private quotationService: QuotationService,
    private pdfService: PdfService
  ) {}

  convertirFecha(fechaISO: string): String {
    return convertirFechaISOaDate(fechaISO);
  }

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
    this.totalPages1 = Math.ceil(this.filteredCotizaciones().length / this.rowsPerPage1);
    if (this.currentPage1 > this.totalPages1) {
      this.currentPage1 = 1;
    }
  }

  displayedCotizaciones(): any[] {
    const startIndex = (this.currentPage1 - 1) * this.rowsPerPage1;
    const endIndex = startIndex + this.rowsPerPage1;
    return this.filteredCotizaciones().slice(startIndex, endIndex);
  }

  filteredCotizaciones(): any[] {
    return this.cotizaciones.filter((cotizacion: any) =>
      cotizacion.user.nombre.toLowerCase().includes(this.searchTerm1.toLowerCase())
    );
  }

  ola(prueba: string) {
    this.pdfService.generatePdfCotizacion(prueba)
  }

  eliminarCotizacion(cotizacionId: any): void {
    Swal.fire({
      title: 'Eliminar cotización',
      text: '¿Estás seguro de eliminar la cotización de la lista?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.quotationService.eliminarQuotation(cotizacionId).subscribe(
          (data) => {
            this.cotizaciones = this.cotizaciones.filter((cotizacion: any) => cotizacion.cotizacionId !== cotizacionId);
            Swal.fire('Cotización eliminada', 'La cotización ha sido eliminada de la base de datos', 'success');
            this.calculateTotalPages1();
          },
          (error) => {
            Swal.fire('Error', 'Error al eliminar la cotización de la base de datos', 'error');
          }
        );
      }
    });
  }

  ngOnInit(): void {
    this.quotationService.listarQuotations().subscribe(
      (cotizaciones: any) => {
        console.log(cotizaciones);
        this.cotizaciones = cotizaciones;
        this.calculateTotalPages1();
      },
      (error) => {
        console.log(error);
        Swal.fire('Error', 'Error al cargar los datos', 'error');
      }
    );
  }
}
