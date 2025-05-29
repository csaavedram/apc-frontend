import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { RouterModule } from '@angular/router';
import { NotaCreditoService } from 'src/app/services/nota-credito.service';
import { PdfService } from 'src/app/services/pdf.service';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-view-notas-credito',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    FormsModule,
    RouterModule,
    MatButton,
  ],
  templateUrl: './view-notas-credito.component.html',
  styleUrl: './view-notas-credito.component.css'
})
export class ViewNotasCreditoComponent {
  notas: any = [];
  usuarios: Map<number, any> = new Map();
  currentPage1 = 1;
  rowsPerPage1 = 10;
  totalPages1 = 0;
  searchTerm1: string = '';

  constructor(
    private notaCreditoService: NotaCreditoService,
    private pdfService: PdfService,
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
    this.totalPages1 = Math.ceil(this.filteredNotas().length / this.rowsPerPage1);
    if (this.currentPage1 > this.totalPages1) {
      this.currentPage1 = 1;
    }
  }

  displayedFacturas(): any[] {
    const startIndex = (this.currentPage1 - 1) * this.rowsPerPage1;
    const endIndex = startIndex + this.rowsPerPage1;
    return this.filteredNotas().slice(startIndex, endIndex);
  }

  filteredNotas(): any[] {
    return this.notas.filter((notas: any) =>
      notas.codigo.toLowerCase().includes(this.searchTerm1.toLowerCase().trim()));
  }

  verNotaCreditoPDF(notaCreditoId: any) {
    this.pdfService.generatePdfNotaCredito(notaCreditoId);
  }

  listarNotasCredito() {
    this.notaCreditoService.listarNotasCredito().subscribe(
      (notas: any) => {
        this.notas = notas;
        this.calculateTotalPages1();
      },
      (error) => {
        console.log(error);
        Swal.fire('Error', 'Error al cargar los datos', 'error');
      }
    );
  }

  ngOnInit(): void {
    this.listarNotasCredito();
  }
}
