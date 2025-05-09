import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AddressesService } from 'src/app/services/addresses.service';
import { DepartmentsService } from 'src/app/services/departments.service';
import { DistrictsService } from 'src/app/services/districts.service';
import { ProvincesService } from 'src/app/services/provinces.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-user-add-addresses',
  templateUrl: './user-add-addresses.component.html',
  styleUrls: ['./user-add-addresses.component.css']
})
export class UserAddAddressesComponent {

  departments: any[] = [];
  provinces: any[] = [];
  districts: any[] = [];
  user: any['id'] = this.loadUserFromLocalStorage()

  addressData = {
    department: {
      departmentId: ''
    },
    province: {
      provinceId: ''
    },
    district: {
      districtId: ''
    },
    name: '',
    user:{
      id: this.user.id
    } 
  }

  provinciasFiltradas: any[] = [];
  distritosFiltrados: any[] = [];

  constructor(
    private snack: MatSnackBar,
    private departmentsService: DepartmentsService, 
    private provincesService: ProvincesService, 
    private districtsService: DistrictsService,
    private addressesService: AddressesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.departmentsService.listarDepartments().subscribe(
      (data: any) => {
        this.departments = data;
      }, (error) => {
        console.log(error);
        Swal.fire('Error !!', 'Error al cargar los datos', 'error');
      }
    );

    this.provincesService.listarProvinces().subscribe(
      (data: any) => {
        this.provinces = data;
      }, (error) => {
        console.log(error);
        Swal.fire('Error !!', 'Error al cargar los datos', 'error');
      }
    );

    this.districtsService.listarDistricts().subscribe(
      (data: any) => {
        this.districts = data;
      }, (error) => {
        console.log(error);
        Swal.fire('Error !!', 'Error al cargar los datos', 'error');
      }
    );
  }

  refreshPage() {
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  }

  guardarInformacion() {
    if (this.addressData.department.departmentId.trim() === '' || this.addressData.department == null) {
      this.snack.open('El departamento es requerido', '', {
        duration: 3000
      });
      return;
    }
    if (this.addressData.province.provinceId.trim() === '' || this.addressData.province == null) {
      this.snack.open('La provincia es requerida', '', {
        duration: 3000
      });
      return;
    }
    if (this.addressData.district.districtId.trim() === '' || this.addressData.district == null) {
      this.snack.open('El distrito es requerido', '', {
        duration: 3000
      });
      return;
    }
    if (this.addressData.name.trim() === '' || this.addressData.name == null) {
      this.snack.open('La direccion es requerida', '', {
        duration: 3000
      });
      return;
    }

    console.log(this.addressData)
    this.addressesService.agregarAddress(this.addressData).subscribe(
      (data) => {
        Swal.fire('Direccion guardada', 'La direccion ha sido guardada con éxito', 'success')
        .then((e) => {
          this.router.navigate(['/user/direcciones']);
        });
      },
      (error) => {
        Swal.fire('Error', 'Error al guardar la información de la direccion', 'error');
        console.log(error)
      }
    );
  }

  filtrarProvincias() {
    const selectedDepartmentId = this.addressData.department.departmentId;
    if (selectedDepartmentId) {
      this.provinciasFiltradas = this.provinces.filter((provinces) => provinces.department.departmentId === selectedDepartmentId);
    } else {
      this.provinciasFiltradas = [];
    }
  }

  filtrarDistritos() {
    const selectedProvinceId = this.addressData.province.provinceId;
    if (selectedProvinceId) {
      this.distritosFiltrados = this.districts.filter((districts) => districts.province.provinceId === selectedProvinceId);
    } else {
      this.distritosFiltrados = [];
    }
  }

  loadUserFromLocalStorage() {
    const storedList = localStorage.getItem('user');
    return storedList ? JSON.parse(storedList) : [];
  }

  volverADirecciones() {
    this.router.navigate(['/user/direcciones']); 
  }
}
