import { Component, OnInit } from '@angular/core';
import { FacturaService } from 'src/app/services/factura.service';
import { PdfService } from 'src/app/services/pdf.service';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-view-facturas',
  templateUrl: './view-facturas.component.html',
  styleUrls: ['./view-facturas.component.css']
})
export class ViewFacturaComponent implements OnInit {
  facturas: any = [];
  usuarios: Map<number, any> = new Map(); // Map to store user details by ID
  currentPage1 = 1;
  rowsPerPage1 = 10;
  totalPages1 = 0;
  searchTerm1: string = '';

  constructor(
    private facturaService: FacturaService,
    private userService: UserService,
    private pdfService: PdfService
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
    this.totalPages1 = Math.ceil(this.filteredFacturas().length / this.rowsPerPage1);
    if (this.currentPage1 > this.totalPages1) {
      this.currentPage1 = 1;
    }
  }

  displayedFacturas(): any[] {
    const startIndex = (this.currentPage1 - 1) * this.rowsPerPage1;
    const endIndex = startIndex + this.rowsPerPage1;
    return this.filteredFacturas().slice(startIndex, endIndex);
  }

  filteredFacturas(): any[] {
    return this.facturas.filter((factura: any) =>
      factura.codigo.toLowerCase().includes(this.searchTerm1.toLowerCase().trim()));
  }

  anularFactura(facturaId: any): void {
    this.facturaService.obtenerFactura(facturaId).subscribe(
      (factura: any) => {
        console.log(factura)
        const facturaInfo = `Código: ${factura.codigo} | Total: S/.${factura.total}`;
        Swal.fire({
          title: 'Anular factura',
          html: `<p>¿Estás seguro de anular esta factura?</p><p>${facturaInfo}</p>`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#3085d6',
          confirmButtonText: 'Anular factura',
          cancelButtonText: 'Volver'
        }).then((result) => {
          if (result.isConfirmed) {
            this.facturaService.anularFactura(facturaId).subscribe(
              (data: any) => {
                console.log(data);
                Swal.fire('Factura anulada', 'La factura ha sido anulada con éxito', 'success');
                this.listarFacturas();
              },
              (error) => {
                console.log(error);
                Swal.fire('Error', 'Ocurrió un error al anular la factura', 'error');
              }
            );
          }
        });
      },
      (error: any) => {
        console.log(error);
        Swal.fire('Error', 'No se pudo obtener la información de la factura', 'error');
      }
    )
  }

  verFacturaPDF(facturaId: any) {
    this.pdfService.generatePdfFactura(facturaId);
  }

  listarFacturas() {
    this.facturaService.listarFacturas().subscribe(
      (facturas: any) => {
        console.log(facturas);
        this.facturas = facturas;
        this.fetchUsuarios(); // Fetch user details after loading facturas
        this.calculateTotalPages1();
      },
      (error) => {
        console.log(error);
        Swal.fire('Error', 'Error al cargar los datos', 'error');
      }
    );
  }

  fetchUsuarios(): void {
    const userIds = [...new Set(this.facturas.map((factura: any) => factura.user.id))]; // Extract unique user IDs
    userIds.forEach((userId: any) => {
      if (!this.usuarios.has(userId)) {
        this.userService.obtenerUsuario(userId).subscribe(
          (usuario: any) => {
            this.usuarios.set(userId, usuario);
          },
          (error) => {
            console.error(`Error al obtener usuario con ID ${userId}:`, error);
          }
        );
      }
    });
  }

  getUsuarioNombre(userId: number): string {
    const usuario = this.usuarios.get(userId);
    return usuario ? `${usuario.nombre} ${usuario.apellido}` : 'Cargando...';
  }

  ngOnInit(): void {
    this.listarFacturas();
  }
}
