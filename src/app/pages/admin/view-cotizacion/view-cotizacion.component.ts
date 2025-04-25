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
    private quotationDetailsService: QuotationDetailsService,
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

  ola(prueba: string) {
    this.pdfService.generatePdfCotizacion(prueba)
  }

  eliminarCotizacion(cotizacionId: any): void {
    Swal.fire({
      title: 'Eliminar cotización',
      text: '¿Estás seguro de eliminar la cotización y sus detalles?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        // Step 1: List and delete all details of the quotation
        this.quotationDetailsService.listarQuotationsDetailsByQuotation(cotizacionId).subscribe(
          (detalles: any) => {
            const deleteDetailPromises = detalles.map((detalle: any) =>
              this.quotationDetailsService.eliminarQuotationDetail(detalle.quotationdetailsId).toPromise()
            );

            Promise.all(deleteDetailPromises)
              .then(() => {
                // Step 2: Delete the quotation after all details are deleted
                this.quotationService.eliminarQuotation(cotizacionId).subscribe(
                  () => {
                    Swal.fire('Cotización eliminada', 'La cotización y sus detalles han sido eliminados de la base de datos', 'success');
                    this.listarCotizaciones();
                  },
                  (error) => {
                    Swal.fire('Error', 'Error al eliminar la cotización de la base de datos', 'error');
                  }
                );
              })
              .catch((error) => {
                Swal.fire('Error', 'Error al eliminar los detalles de la cotización', 'error');
              });
          },
          (error) => {
            Swal.fire('Error', 'Error al obtener los detalles de la cotización', 'error');
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
