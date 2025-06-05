import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { CategoriaService } from 'src/app/services/categoria.service';
import { ProductoService } from 'src/app/services/producto.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-producto',
  templateUrl: './add-producto.component.html',
  styleUrls: ['./add-producto.component.css']
})
export class AddProductoComponent implements OnInit {

  productoData = {
    nombreProducto: '',
    precio: '',
    descripcion: '',
    imagen: '',
    sku: '',
    dateCreated: '',
    status: 0,
    stock: '',
    categoria: {
      categoriaId: ''
    },
  };

  categorys: any[] = [];

  constructor(
    private snack: MatSnackBar,
    private productoService: ProductoService,
    private categoriaService: CategoriaService,
    private router: Router) { }
  ngOnInit(): void {
    this.categoriaService.listarCategorias().subscribe(
      (data: any) => {
        this.categorys = data;
      }, (error) => {
        console.log(error);
        Swal.fire('Error !!', 'Error al cargar los datos', 'error');
      }
    );
  }
  volverAProductos() {
    this.router.navigate(['/admin/productos']); 
  }
  guardarInformacion() {
    console.log(this.productoData);
    if (this.productoData.nombreProducto.trim() === '' || this.productoData.nombreProducto == null) {
      this.snack.open('El nombre del producto es requerido', '', {
        duration: 3000
      });
      return;
    }
  

    if (this.productoData.sku.trim() === '' || this.productoData.sku == null) {
      this.snack.open('El SKU es requerido', '', {
        duration: 3000
      });
      return;
    }

    if (this.productoData.descripcion.trim() === '' || this.productoData.descripcion == null) {
      this.snack.open('La descripción es requerida', '', {
        duration: 3000
      });
      return;
    }
  
    if (this.productoData.precio.trim() === '' || this.productoData.precio == null) {
      this.snack.open('El precio es requerido', '', {
        duration: 3000
      });
      return;
    }
    if (this.productoData.stock.trim() === '' || this.productoData.stock == null) {
      this.snack.open('El stock inicial es requerido', '', {
        duration: 3000
      });
      return;
    }

    if (parseFloat(this.productoData.stock) <= 0) {
      this.snack.open('El stock debe ser un número mayor que cero', '', {
        duration: 3000
      });
      return;
    }

    if (parseFloat(this.productoData.precio) <= 0) {
      this.snack.open('El precio debe ser un número mayor que cero', '', {
        duration: 3000
      });
      return;
    }
    const stockRegex = /^\d+$/;
    if (!stockRegex.test(this.productoData.stock)) {
      this.snack.open('El stock debe ser un número entero', '', {
        duration: 3000
      });
      return;
    }
    const precioRegex = /^\d+(\.\d{1,2})?$/;
    if (!precioRegex.test(this.productoData.precio)) {
      this.snack.open('El precio debe tener como máximo dos decimales', '', {
        duration: 3000
      });
      return;
    }
    this.productoData.dateCreated = this.getCurrentDate();
    this.productoData.status = 1;
  
    this.productoService.listarProductos().subscribe(
      (productos: any) => {
        const existeNombreProducto = productos.some((producto: any) => producto.nombreProducto.trim().toLowerCase() === this.productoData.nombreProducto.trim().toLowerCase());
        const existeSKU = productos.some((producto: any) => producto.sku.trim().toLowerCase() === this.productoData.sku.trim().toLowerCase());

        if (existeNombreProducto) {
          this.snack.open('Ya existe un producto con el mismo nombre', '', {
            duration: 3000
          });
        } else if (existeSKU) {
          this.snack.open('Ya existe un producto con el mismo SKU', '', {
            duration: 3000
          });
        } else {
          // Si no existe un producto con el mismo nombre ni SKU, proceder con la inserción
          this.productoService.agregarProducto(this.productoData).subscribe(
            (data) => {
              console.log(data);
              Swal.fire('Producto guardado', 'El producto ha sido guardado con éxito', 'success');
              this.productoData = {
                nombreProducto: '',
                precio: '',
                descripcion: '',
                imagen: '',
                sku: '',
                dateCreated: '',
                status: 0,
                stock: '',
                categoria: {
                  categoriaId: ''
                },
              }
              this.router.navigate(['/admin/productos'])
            },
            (error) => {
              Swal.fire('Error', 'Error al guardar la información del producto', 'error');
            }
          );
        }
      },
      (error) => {
        console.error('Error al obtener la lista de productos:', error);
        this.snack.open('Error al obtener la lista de productos', '', {
          duration: 3000
        });
      }
    );
  }
  getCurrentDate(): string {
    const currentDate = new Date();
    return currentDate.toISOString();
  }
}
