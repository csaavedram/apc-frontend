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
import { QuotationDetailsService } from 'src/app/services/quotation-details.service';

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
    console.log(this.cotizaciones);
    return this.cotizaciones.filter((cotizacion: any) => {
      const user = cotizacion.user || {};
      const nombre = user.nombre || '';
      const razonSocial = user.razonSocial || '';
      return (
        nombre.toLowerCase().includes(this.searchTerm1.toLowerCase()) ||
        razonSocial.toLowerCase().includes(this.searchTerm1.toLowerCase())
      );
    });
  }

  vercotizacionPDF(cotizacionId: any) {
    console.log("PRUEBA PDF");
    console.log(cotizacionId);
    this.pdfService.generatePdfCotizacion(cotizacionId);
  }

  cancelarCotizacion(cotizacionId: any): void {
    Swal.fire({
      title: 'Cancelar cotización',
      text: '¿Estás seguro de cancelar esta cotización?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Cancelar cotización',
      cancelButtonText: 'Volver'
    }).then((result) => {
      if (result.isConfirmed) {
        this.quotationService.cancelarCotizacion(cotizacionId).subscribe(
          () => {
            Swal.fire('Cotización cancelada', 'La cotización ha sido cancelada con éxito', 'success');
            this.listarCotizaciones();
          },
          (error) => {
            console.log(error)
            Swal.fire('Error', 'Ocurrió un error al cancelar la cotización', 'error');
          }
        );
      }
    });
  }

  listarCotizaciones() {
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

  ngOnInit(): void {
    this.listarCotizaciones();
  }
}
