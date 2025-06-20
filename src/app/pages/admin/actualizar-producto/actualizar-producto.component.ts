import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductoService } from 'src/app/services/producto.service';
import Swal from 'sweetalert2';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatNativeDateModule } from '@angular/material/core';
import { CategoriaService } from 'src/app/services/categoria.service';

@Component({
  selector: 'app-actualizar-producto',
  templateUrl: './actualizar-producto.component.html',
  styleUrls: ['./actualizar-producto.component.css']
})
export class ActualizarProductoComponent implements OnInit {

  constructor(
    private snack: MatSnackBar,
    private route: ActivatedRoute,
    private productoService: ProductoService,
    private categoriaService: CategoriaService,
    private router: Router) { }

  productoId = 0;
  producto: any;
  productoOriginal: any;
  categorys: any[] = [];

  // Propiedades para el sistema híbrido de imágenes
  imagenMethod: number = 1; // Por defecto URL (1), para mantener compatibilidad con productos existentes
  selectedFile: File | null = null;
  imagenUrl: string = '';
  uploadProgress: number = 0;
  imagePreview: string | null = null;
  ngOnInit(): void {
    this.productoId = this.route.snapshot.params['productoId'];
    this.productoService.obtenerProducto(this.productoId).subscribe(
      (data) => {
        this.producto = data;
        this.productoOriginal = { ...this.producto }; // Hacemos una copia de los datos del producto para poder hacer una validación de cambio.
        
        // Inicializar el sistema de imágenes
        if (this.producto.imagen) {
          this.imagenUrl = this.producto.imagen;
          this.imagenMethod = 1; // URL por defecto
        }
        
        console.log(this.producto)
        console.log(this.productoOriginal)
      },
      (error) => {
        console.log(error);
      }
    )
    this.categoriaService.listarCategorias().subscribe(
      (data: any) => {
        this.categorys = data;
      }, (error) => {
        console.log(error);
        Swal.fire('Error !!', 'Error al cargar los datos', 'error');
      }
    );
  }
  normalizarEspacios(cadena: string): string {
    return cadena.replace(/\s+/g, ' ').trim();
  }
  volverAProductos() {
    this.router.navigate(['/admin/productos']); 
  }  public async actualizarDatos(){
    // Normalizamos espacios en blanco en las cadenas y eliminar espacios al inicio y al final
    this.producto.nombreProducto = this.normalizarEspacios(this.producto.nombreProducto);
    this.producto.sku = this.normalizarEspacios(this.producto.sku);
    this.producto.descripcion = this.normalizarEspacios(this.producto.descripcion);
  
    console.log(this.producto);
  
    if (!this.producto.nombreProducto || !this.producto.sku) {
      this.snack.open('El nombre del producto y el SKU son requeridos', '', {
        duration: 3000
      });
      return;
    }
    if (this.producto.descripcion.trim() === '' || this.producto.descripcion == null) {
      this.snack.open('La descripción es requerida', '', {
        duration: 3000
      });
      return;
    }
  
    if (this.producto.precio == null) {
      this.snack.open('El precio es requerido', '', {
        duration: 3000
      });
      return;
    }
    if (parseFloat(this.producto.precio) <= 0) {
      this.snack.open('El precio debe ser un número mayor que cero', '', {
        duration: 3000
      });
      return;
    }
    if (parseFloat(this.producto.stock) <= 0) {
      this.snack.open('El stock debe ser un número mayor que cero', '', {
        duration: 3000
      });
      return;
    }

    const stockRegex = /^\d+$/;
    if (!stockRegex.test(this.producto.stock)) {
      this.snack.open('El stock debe ser un número entero', '', {
        duration: 3000
      });
      return;
    }

    const precioRegex = /^\d+(\.\d{1,2})?$/;
    if (!precioRegex.test(this.producto.precio)) {
      this.snack.open('El precio debe tener como máximo dos decimales', '', {
        duration: 3000
      });
      return;
    }

    // Preparar imagen
    try {
      const nuevaImagenUrl = await this.prepareImageUrl();
      this.producto.imagen = nuevaImagenUrl;
    } catch (error: any) {
      this.snack.open(error.message || 'Error al procesar la imagen', '', {
        duration: 3000
      });
      return;
    }
  
    // Verificar si el nombre del producto ya existe en la lista de productos excluyendo el producto actual
    const nombreModificado = this.producto.nombreProducto.trim().toLowerCase() !== this.productoOriginal.nombreProducto.trim().toLowerCase();
    console.log(nombreModificado);
    const skuModificado = this.producto.sku.trim().toLowerCase() !== this.productoOriginal.sku.trim().toLowerCase();
    console.log(skuModificado);
  
    if (nombreModificado || skuModificado) {
      // Si se han modificado el nombre de producto o el SKU, proceder con la validación
      this.productoService.listarProductos().subscribe(
        (productos: any) => {
          if (nombreModificado) {
            const existeNombreProducto = productos.some((producto: any) => producto.nombreProducto.trim().toLowerCase() === this.producto.nombreProducto.trim().toLowerCase() && producto._id !== this.productoId);
            if (existeNombreProducto) {
              this.snack.open('Ya existe un producto con el mismo nombre', '', {
                duration: 3000
              });
              return;
            }
          }
  
          if (skuModificado) {
            const existeSKU = productos.some((producto: any) => producto.sku.trim().toLowerCase() === this.producto.sku.trim().toLowerCase() && producto._id !== this.productoId);
            if (existeSKU) {
              this.snack.open('Ya existe un producto con el mismo SKU', '', {
                duration: 3000
              });
              return;
            }
          }
  
          // Si no existe un producto con el mismo nombre ni SKU, proceder con la actualización
          this.productoService.actualizarProducto(this.producto).subscribe(
            (data) => {
              Swal.fire('Producto actualizado', 'El producto ha sido actualizado con éxito', 'success').then(
                (e)=> {
                  this.router.navigate(['/admin/productos']);
                }
              );
            },
            (error) =>{
              Swal.fire('Error en el sistema', 'No se ha podido actualizar la información del producto', 'error');
              console.log(error);
            }
          );
        },
        (error) => {
          console.error('Error al obtener la lista de productos:', error);
          this.snack.open('Error al obtener la lista de productos', '', {
            duration: 3000
          });
        }
      );
    } else {
      // Si no se han modificado el nombre de producto ni el SKU, no se realiza la validación
      this.productoService.actualizarProducto(this.producto).subscribe(
        (data) => {
          Swal.fire('Producto actualizado', 'El producto ha sido actualizado con éxito', 'success').then(
            (e)=> {
              this.router.navigate(['/admin/productos']);
            }
          );
        },
        (error) =>{
          Swal.fire('Error en el sistema', 'No se ha podido actualizar la información del producto', 'error');
          console.log(error);
        }      );
    }
  }

  // Métodos para el sistema híbrido de imágenes
  onImageMethodChange(event: any) {
    this.imagenMethod = event.index;
    if (this.imagenMethod === 1) {
      // Si cambió a URL, sincronizar con la imagen actual del producto
      this.imagenUrl = this.producto.imagen || '';
    }
    this.resetImageData(false);
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

  resetImageData(resetUrl: boolean = true) {
    this.selectedFile = null;
    if (resetUrl) {
      this.imagenUrl = '';
    }
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
        // Si no hay archivo seleccionado, mantener la imagen actual
        return this.producto.imagen || '';
      }
    } else {
      // Método URL
      if (this.imagenUrl.trim()) {
        return this.imagenUrl.trim();
      } else {
        // Si no hay URL, mantener la imagen actual
        return this.producto.imagen || '';
      }
    }
  }
}