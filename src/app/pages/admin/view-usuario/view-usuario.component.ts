import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'app-view-usuario',
  templateUrl: './view-usuario.component.html',
  styleUrls: ['./view-usuario.component.css']
})
export class ViewUsuarioComponent implements OnInit {
  usuarios: any = [];
  currentPage1 = 1;
  rowsPerPage1 = 10;
  totalPages1 = 0;
  searchTerm1: string = ''; // Nueva propiedad para el término de búsqueda
  documentFilter: string = 'all'; // Filter for DNI/RUC

  constructor(
    private userService: UserService
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
    this.totalPages1 = Math.ceil(this.filteredUsuarios().length / this.rowsPerPage1);
    if (this.currentPage1 > this.totalPages1) {
      this.currentPage1 = 1;
    }
  }
  onDocumentFilterChange(): void {
    this.currentPage1 = 1; // Reset to first page when filter changes
    this.calculateTotalPages1();
  }

  getFilteredCount(): number {
    return this.filteredUsuarios().length;
  }

  displayedUsuarios(): any[] {
    const startIndex = (this.currentPage1 - 1) * this.rowsPerPage1;
    const endIndex = startIndex + this.rowsPerPage1;
    return this.filteredUsuarios().slice(startIndex, endIndex);
  }  filteredUsuarios(): any[] {
    return this.usuarios.filter((usuario: any) => {
      // Exclude admin user
      if (usuario.username && usuario.username.toLowerCase() === 'admin') {
        return false;
      }

      // Filter by document type (DNI/RUC) based on username length
      if (this.documentFilter !== 'all') {
        const username = usuario.username || '';
        // Check if username contains only numbers
        const isNumeric = /^\d+$/.test(username);
        
        if (isNumeric) {
          if (this.documentFilter === 'dni' && username.length !== 8) {
            return false;
          }
          if (this.documentFilter === 'ruc' && username.length !== 11) {
            return false;
          }
        } else {
          // If username is not numeric, exclude it when filtering by DNI/RUC
          return false;
        }
      }
        // Filter by combined name (nombre + apellido) and username
      const fullName = `${usuario.nombre || ''} ${usuario.apellido || ''}`.toLowerCase();
      const username = (usuario.username || '').toLowerCase();
      const searchTerm = this.searchTerm1.toLowerCase();
      
      return fullName.includes(searchTerm) || username.includes(searchTerm);
    });
  }

  ngOnInit(): void {
    combineLatest([this.userService.listarUsuarios()]).subscribe(
      ([usuarios]: [any]) => {
        this.usuarios = usuarios;
        this.calculateTotalPages1();
      },
      (error) => {
        console.log(error);
        Swal.fire('Error', 'Error al cargar los datos', 'error');
      }
    );
  }
}
