import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CategoriaService } from 'src/app/services/categoria.service';
import { ProductoService } from 'src/app/services/producto.service';
import { ToastrService } from 'ngx-toastr';
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
    stock: 0,
    esPerecible: false,
    categoria: {
      categoriaId: ''
    },
  };

  categorys: any[] = [];
  
  // Propiedades para el sistema híbrido de imágenes
  imagenMethod: number = 0; // 0 = archivo, 1 = URL
  selectedFile: File | null = null;
  imagenUrl: string = '';
  uploadProgress: number = 0;
  imagePreview: string | null = null;
  constructor(
    private toastr: ToastrService, 
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
  }  async guardarInformacion() {
    console.log(this.productoData);

    if (this.productoData.nombreProducto.trim() === '' || this.productoData.nombreProducto == null) {
      this.toastr.error('El nombre del producto es requerido', 'Error');
      return;
    }
      if (this.productoData.sku.trim() === '' || this.productoData.sku == null) {
      this.toastr.error('El SKU es requerido', 'Error');
      return;
    }

    if (this.productoData.descripcion.trim() === '' || this.productoData.descripcion == null) {
      this.toastr.error('La descripción es requerida', 'Error');
      return;
    }
    if (this.productoData.precio.trim() === '' || this.productoData.precio == null) {
      this.toastr.error('El precio es requerido', 'Error');
      return;
    }

    if (parseFloat(this.productoData.precio) <= 0) {
      this.toastr.error('El precio debe ser un número mayor que cero', 'Error');
      return;
    }

    const precioRegex = /^\d+(\.\d{1,2})?$/;
    if (!precioRegex.test(this.productoData.precio)) {
      this.toastr.error('El precio debe tener como máximo dos decimales', 'Error');
      return;
    }

    // Validar imagen
    try {
      this.productoData.imagen = await this.prepareImageUrl();
    } catch (error: any) {
      this.toastr.error(error.message || 'Error al procesar la imagen', 'Error');
      return;
    }

    this.productoData.dateCreated = this.getCurrentDate();
    this.productoData.status = 1;
  
    this.productoService.listarProductos().subscribe(
      (productos: any) => {
        const existeNombreProducto = productos.some((producto: any) => producto.nombreProducto.trim().toLowerCase() === this.productoData.nombreProducto.trim().toLowerCase());
        const existeSKU = productos.some((producto: any) => producto.sku.trim().toLowerCase() === this.productoData.sku.trim().toLowerCase());

        if (existeNombreProducto) {
          this.toastr.error('Ya existe un producto con el mismo nombre', 'Error');
        } else if (existeSKU) {
          this.toastr.error('Ya existe un producto con el mismo SKU', 'Error');
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
                stock: 0,
                esPerecible: false,
                categoria: {
                  categoriaId: ''
                },
              }
              this.resetImageData();
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
        this.toastr.error('Error al obtener la lista de productos', 'Error');
      }
    );
  }getCurrentDate(): string {
    const currentDate = new Date();
    return currentDate.toISOString();
  }

  // Métodos para el sistema híbrido de imágenes
  onImageMethodChange(event: any) {
    this.imagenMethod = event.index;
    this.resetImageData();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.createImagePreview(file);
    }
  }

  createImagePreview(file: File) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imagePreview = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  getImagePreview(): string | null {
    if (this.imagenMethod === 0) {
      // Método archivo
      return this.imagePreview;
    } else {
      // Método URL
      return this.imagenUrl.trim() ? this.imagenUrl : null;
    }
  }

  resetImageData() {
    this.selectedFile = null;
    this.imagenUrl = '';
    this.uploadProgress = 0;
    this.imagePreview = null;
  }

  async uploadFile(): Promise<string> {
    if (!this.selectedFile) {
      throw new Error('No hay archivo seleccionado');
    }

    this.uploadProgress = 0;
    const formData = new FormData();
    formData.append('file', this.selectedFile);

    try {
      // Subir la imagen al backend
      const response = await fetch('http://localhost:8080/uploads/imagen', {
        method: 'POST',
        body: formData
      });
      if (!response.ok) {
        throw new Error('Error al subir la imagen');
      }
      const imageUrl = await response.text();
      this.uploadProgress = 100;
      return imageUrl;
    } catch (error) {
      this.uploadProgress = 0;
      throw error;
    }
  }

  async prepareImageUrl(): Promise<string> {
    if (this.imagenMethod === 0) {
      // Método archivo
      if (this.selectedFile) {
        return await this.uploadFile();
      } else {
        throw new Error('No se ha seleccionado ningún archivo');
      }
    } else {
      // Método URL
      if (this.imagenUrl.trim()) {
        return this.imagenUrl.trim();
      } else {
        throw new Error('No se ha proporcionado una URL de imagen');
      }
    }
  }
}
