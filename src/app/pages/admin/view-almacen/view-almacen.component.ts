import { Component, OnInit } from '@angular/core';
import { AlmacenService } from 'src/app/services/almacen.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import Swal from 'sweetalert2';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'app-view-almacen',
  templateUrl: './view-almacen.component.html',
  styleUrls: ['./view-almacen.component.css']
})
export class ViewAlmacenComponent implements OnInit {
  almacenes: any = [];
  currentPage1 = 1;
  rowsPerPage1 = 10;
  totalPages1 = 0;
  searchTerm1: string = '';
  
  // Modal properties
  showMapModal: boolean = false;
  selectedAddress: string = '';
  mapUrl: SafeResourceUrl = '';

  constructor(
    private almacenService: AlmacenService,
    private sanitizer: DomSanitizer
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

  display(): any[] {
    const startIndex = (this.currentPage1 - 1) * this.rowsPerPage1;
    const endIndex = startIndex + this.rowsPerPage1;
    return this.filteredProductos().slice(startIndex, endIndex);
  }

  filteredProductos(): any[] {
    return this.almacenes.filter((almacen: any) =>
      almacen.direccion.toLowerCase().includes(this.searchTerm1.toLowerCase())
    );
  }

  eliminarAlmacen(almacenId: any): void {
    Swal.fire({
      title: 'Eliminar Almacén',
      text: '¿Estás seguro de eliminar el almacén de la lista?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.almacenService.eliminarAlmacen(almacenId).subscribe(
          (data) => {
            this.almacenes = this.almacenes.filter((almacen: any) => almacen.almacenId !== almacenId);
            Swal.fire('Almacén eliminado', 'El almacén ha sido eliminado de la base de datos', 'success');
            this.calculateTotalPages1();
          },
          (error) => {
            Swal.fire('Error', 'Error al eliminar el almacén de la base de datos', 'error');
          }
        );
      }
    });
  }

  openInGoogleMaps(address: string): void {
    if (!address || address.trim() === '') {
      Swal.fire('Error', 'La dirección no está disponible', 'error');
      return;
    }

    this.selectedAddress = address.trim();
    
    // Create Google Maps embed URL without API key (using q parameter)
    const encodedAddress = encodeURIComponent(this.selectedAddress);
    const embedUrl = `https://maps.google.com/maps?q=${encodedAddress}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    
    // Sanitize the URL for security
    this.mapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
    
    // Show the modal
    this.showMapModal = true;
  }

  closeMapModal(): void {
    this.showMapModal = false;
    this.selectedAddress = '';
    this.mapUrl = '';
  }

  openInGoogleMapsExternal(): void {
    if (this.selectedAddress) {
      const encodedAddress = encodeURIComponent(this.selectedAddress);
      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
      window.open(googleMapsUrl, '_blank');
    }
  }

  ngOnInit(): void {
    combineLatest([this.almacenService.listarAlmacenes()]).subscribe(
      ([almacenes]: [any]) => {
        this.almacenes = almacenes;
        this.calculateTotalPages1();
      },
      (error) => {
        console.log(error);
        Swal.fire('Error', 'Error al cargar los datos', 'error');
      }
    );
  }
}
