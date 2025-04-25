import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ProductoService } from 'src/app/services/producto.service';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { UserService } from 'src/app/services/user.service';
import { QuotationService } from 'src/app/services/quotation.service';
import { QuotationDetailsService } from 'src/app/services/quotation-details.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-cotizacion',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    FormsModule,
    RouterModule,
    MatButton,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatRadioModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './add-cotizacion.component.html',
  styleUrls: ['./add-cotizacion.component.css']
})
export class AddCotizacionComponent {
  cotizacionData = {
    divisa: '',
    tipoPago: '',
    plazoEntrega: this.getCurrentDate(),
    validezOferta: this.getCurrentDate(),
    total: 0.0,
    userId: null,
    tipo: 'bien',
    productoId: null,
    usuarioId: '',
  };

  usuario = {
    id: '',
    nombre: '',
    apellido: '',
    razonSocial: '',
    ruc: '',
    tipoUsuario: ''
  };

  productos: any[] = [];
  servicios: any[] = [];
  detalleProductos: any[] = [];
  detalleServicios: any[] = [];
  selectedProduct: any = null;
  selectedServiceType = { type: '', price: 0 };
  skuChanged: boolean = false;
  items: any[] = [];
  tipoBusqueda = 'ruc';
  listaUsuarios: any[] = [];
  usuarioInput: string = ''; // Input value
  suggestions: string[] = []; // Full list of suggestions
  filteredSuggestions: string[] = []; // Filtered suggestions to display

  constructor(
    private snack: MatSnackBar,
    private productoService: ProductoService,
    private quotationService: QuotationService,
    private usuarioService: UserService,
    private quotationDetailsService: QuotationDetailsService,
    private userService: UserService,
    private router: Router
  ) {}

  onUsuarioInputChange(): void {
    const input = this.usuarioInput.trim().toLowerCase();
    if (this.tipoBusqueda === 'razon_social' && input.length > 0) {
      this.filteredSuggestions = this.listaUsuarios
        .filter(usuario => usuario.razonSocial?.toLowerCase().includes(input))
        .map(usuario => usuario.razonSocial);
    } else {
      this.filteredSuggestions = [];
    }
  }

  selectSuggestion(suggestion: string): void {
    this.usuarioInput = suggestion;
    this.usuario = this.listaUsuarios.find(
      usuario => usuario.razonSocial?.toLowerCase() === suggestion.toLowerCase()
    );
    this.filteredSuggestions = [];
  }

  ngOnInit(): void {
    this.listarProductos();
    this.listarUsuarios();
  }

  listarProductos(): void {
    this.productoService.listarProductos().subscribe(
      (productos: any) => {
        this.productos = productos;
        this.actualizarItems();
      },
      (error) => {
        console.error('Error al listar productos:', error);
        this.snack.open('Error al listar productos', '', {
          duration: 3000
        });
      }
    );
  }

  listarUsuarios(): void {
    this.userService.listarUsuarios().subscribe(
      (usuarios: any) => {
        this.listaUsuarios = usuarios;
        console.log('Lista de usuarios:', this.listaUsuarios);
      },
      (error) => {
        console.error('Error al listar usuarios:', error);
        this.snack.open('Error al listar usuarios', '', {
          duration: 3000
        });
      }
    );
  }

  actualizarItems(): void {
    if (this.cotizacionData.tipo === 'bien') {
      this.items = this.productos;
    } else {
      this.items = this.servicios;
    }
    console.log('Items filtrados:', this.items);
  }

  onTipoChange(): void {
    const preservedDivisa = this.cotizacionData.divisa;
    const preservedTipoPago = this.cotizacionData.tipoPago;

    this.selectedProduct = null;
    this.selectedServiceType = { type: '', price: 0 };

    this.actualizarItems();

    this.cotizacionData.divisa = preservedDivisa;
    this.cotizacionData.tipoPago = preservedTipoPago;

    console.log('Divisa y Tipo de Pago preservados:', this.cotizacionData.divisa, this.cotizacionData.tipoPago);
  }

  buscarProductoPorSku(): void {
    const skuBuscado = this.cotizacionData.productoId;
    const productoEncontrado = this.productos.find((producto) => producto.sku === skuBuscado);

    if (!productoEncontrado) {
      Swal.fire('Producto no encontrado', 'El SKU que has ingresado no está registrado en productos', 'error');
      this.selectedProduct = null;
      return;
    }

    this.skuChanged = true;
    this.selectedProduct = { ...productoEncontrado };
  }

  agregarDetalleCotizacion(newPrice: number, cantidad: number): void {
    if (!this.selectedProduct) {
      this.snack.open('Debe buscar un producto válido antes de agregar un detalle', '', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
      return;
    }

    if (!newPrice || isNaN(newPrice)) {
      this.snack.open('Debe ingresar un nuevo precio válido', '', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
      return;
    }

    if (!cantidad || isNaN(cantidad)) {
      this.snack.open('Debe ingresar una cantidad válida', '', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
      return;
    }

    if (cantidad < 1) {
      this.snack.open('La cantidad no puede ser menor a 1', '', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
      return;
    }

    if (cantidad > this.selectedProduct.stock) {
      this.snack.open(`La cantidad no puede ser mayor al stock disponible (${this.selectedProduct.stock})`, '', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
      return;
    }

    if (newPrice < this.selectedProduct.precio) {
      this.snack.open('El nuevo precio no puede ser menor que el precio unitario', '', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
      return;
    }

    const existingProductIndex = this.detalleProductos.findIndex(
      (detalle) => detalle.productoId === this.selectedProduct.productoId
    );

    if (existingProductIndex !== -1) {
      const existingProduct = this.detalleProductos[existingProductIndex];

      if (existingProduct.newPrice !== newPrice) {
        this.snack.open(
          `El precio ingresado (${newPrice}) es diferente al registrado anteriormente (${existingProduct.newPrice}). Debe ser igual.`,
          '',
          {
            duration: 3000,
            panelClass: ['snackbar-error']
          }
        );
        return;
      }

      const newTotalQuantity = existingProduct.cantidad + cantidad;

      if (newTotalQuantity > this.selectedProduct.stock) {
        this.snack.open(`No se puede agregar más. Stock disponible: ${this.selectedProduct.stock}`, '', {
          duration: 3000,
          panelClass: ['snackbar-error']
        });
        return;
      }

      existingProduct.cantidad = newTotalQuantity;
      existingProduct.totalPrice = existingProduct.newPrice * newTotalQuantity;
      existingProduct.igv = existingProduct.totalPrice * 0.18;

      this.snack.open('Cantidad actualizada correctamente', '', {
        duration: 3000,
        panelClass: ['snackbar-success']
      });
    } else {
      const igv = newPrice * cantidad * 0.18;

      const detalle = {
        productoId: this.selectedProduct.productoId,
        nombreProducto: this.selectedProduct.nombreProducto,
        cantidad,
        unitPrice: this.selectedProduct.precio,
        newPrice,
        totalPrice: newPrice * cantidad,
        igv,
      };

      this.detalleProductos.push(detalle);

      this.snack.open('Producto agregado al detalle correctamente', '', {
        duration: 3000,
        panelClass: ['snackbar-success']
      });
    }

    this.selectedProduct = null;
    this.cotizacionData.productoId = null;
  }

  incrementarCantidad(index: number): void {
    const detalle = this.detalleProductos[index];
    const producto = this.productos.find((p) => p.productoId === detalle.productoId);

    if (!producto) {
      console.error('Producto no encontrado:', detalle.productoId);
      this.snack.open('Producto no encontrado en el inventario', '', {
        duration: 3000,
      });
      return;
    }

    if (detalle.cantidad + 1> producto.stock) {
      this.snack.open(`No se puede agregar más. Stock disponible: ${producto.stock}`, '', {
        duration: 3000,
      });
      return;
    }

    detalle.cantidad++;
    detalle.totalPrice = detalle.newPrice * detalle.cantidad;
    detalle.igv = detalle.totalPrice * 0.18;
  }

  disminuirCantidad(index: number): void {
    const detalle = this.detalleProductos[index];
    const producto = this.productos.find((p) => p.productoId === detalle.productoId);

    if (!producto) {
      console.error('Producto no encontrado:', detalle.productoId);
      this.snack.open('Producto no encontrado en el inventario', '', {
        duration: 3000,
      });
      return;
    }

    if (detalle.cantidad - 1 <= 0) {
      this.snack.open('La cantidad no puede ser menor a 1', '', {
        duration: 3000,
      });
      return;
    }

    detalle.cantidad--;
    detalle.totalPrice = detalle.newPrice * detalle.cantidad;
    detalle.igv = detalle.totalPrice * 0.18;
  }

  agregarDetalleServicio(price: number): void {
    if (!this.selectedServiceType.type) {
      Swal.fire('Error', 'Debe seleccionar un tipo de servicio', 'error');
      return;
    }

    const detalle = {
      serviceType: this.selectedServiceType.type,
      price
    };

    this.detalleServicios.push(detalle);
    Swal.fire('Detalle agregado', 'El detalle de servicio ha sido agregado', 'success');
    this.selectedServiceType = { type: '', price: 0 };
  }

  eliminarDetalleProducto(index: number): void {
    this.detalleProductos.splice(index, 1);
    Swal.fire('Eliminado', 'El detalle del producto ha sido eliminado', 'success');
  }

  eliminarDetalleServicio(index: number): void {
    this.detalleServicios.splice(index, 1);
    Swal.fire('Eliminado', 'El detalle del servicio ha sido eliminado', 'success');
  }

  volverACategorias() {
    this.router.navigate(['/admin/cotizaciones']);
  }

  guardarInformacion(): void {
    if (this.usuario.id === '') {
      this.snack.open('Debe buscar un usuario por DNI o RUC antes de guardar la cotización', '', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
      return;
    }

    if (!this.cotizacionData.divisa) {
      this.snack.open('Debe seleccionar una divisa', '', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
      return;
    }

    if (!this.cotizacionData.tipoPago) {
      this.snack.open('Debe seleccionar un tipo de pago', '', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
      return;
    }

    if (!this.cotizacionData.plazoEntrega) {
      this.snack.open('Debe seleccionar un plazo de entrega', '', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
      return;
    }

    if (!this.cotizacionData.validezOferta) {
      this.snack.open('Debe seleccionar una validez de oferta', '', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
      return;
    }

    if (this.detalleProductos.length === 0 && this.detalleServicios.length === 0) {
      Swal.fire('Error', 'Debe agregar al menos un detalle de producto o servicio', 'error');
      return;
    }

    const cotizacionPayload = {
      divisa: this.cotizacionData.divisa,
      tipoPago: this.cotizacionData.tipoPago,
      plazoEntrega: this.cotizacionData.plazoEntrega,
      validezOferta: this.cotizacionData.validezOferta,
      total: this.calcularTotal(),
      user: {
        id: this.usuario.id,
      },
    };

    this.quotationService.agregarQuotation(cotizacionPayload).subscribe(
      (quotation: any) => {
        const quotationId = quotation.quotationId;

        this.detalleProductos.forEach((detalle) => {
          const detalleProductoPayload = {
            cantidad: detalle.cantidad,
            totalPrice: detalle.totalPrice,
            unitPrice: detalle.unitPrice,
            newPrice: detalle.newPrice,
            serviceType: null,
            product: {
              productoId: detalle.productoId,
            },
            quotation: {
              quotationId: quotationId,
            },
            createdAt: new Date()
          };

          this.quotationDetailsService.agregarQuotationDetail(detalleProductoPayload).subscribe(
            () => console.log('Detalle de producto guardado'),
            (error) => console.error('Error al guardar detalle de producto:', error)
          );
        });

        this.detalleServicios.forEach((detalle) => {
          const detalleServicioPayload = {
            cantidad: 1,
            totalPrice: detalle.price,
            unitPrice: null,
            newPrice: null,
            serviceType: detalle.serviceType,
            product: null,
            quotation: {
              quotationId: quotationId,
            },
            createdAt: new Date(),
          };

          this.quotationDetailsService.agregarQuotationDetail(detalleServicioPayload).subscribe(
            () => console.log('Detalle de servicio guardado'),
            (error) => console.error('Error al guardar detalle de servicio:', error)
          );
        });

        Swal.fire('Éxito', 'La cotización y sus detalles han sido guardados correctamente', 'success');
      },
      (error) => {
        console.error('Error al guardar la cotización:', error);
        Swal.fire('Error', 'Ocurrió un error al guardar la cotización', 'error');
      }
    );
  }

  getCurrentDate(): string {
    const currentDate = new Date();
    return currentDate.toISOString().split('T')[0];
  }

  buscarClientePorRuc(): void {
    const ruc = this.usuarioInput;

    if (!ruc.trim()) {
      Swal.fire('Error', 'Debe ingresar un RUC válido', 'error');
      return;
    }

    this.userService.obtenerUsuarioPorRuc(ruc).subscribe(
      (usuario: any) => {
        if (usuario) {
          this.usuario = usuario;
        } else {
          Swal.fire('No encontrado', 'No se encontró un usuario con el DNI o RUC ingresado', 'error');
        }
      },
      (error: any) => {
        console.log(error)
        console.error('Error al buscar usuario:', error);
        Swal.fire('Error', 'Ocurrió un error al buscar el usuario', 'error');
      }
    );
  }

  buscarClientePorRazonSocial(): void {
    const razonSocial = this.usuarioInput;

    if (!razonSocial.trim()) {
      Swal.fire('Error', 'Debe ingresar una razón social válida', 'error');
      return;
    }

    const usuarioEncontrado = this.listaUsuarios.find(
      (usuario) => usuario.razonSocial?.toLowerCase() === razonSocial.toLowerCase()
    );

    if (usuarioEncontrado) {
      this.usuario = usuarioEncontrado;
      Swal.fire('Éxito', 'Empresa encontrada', 'success');
    } else {
      Swal.fire('No encontrado', 'No se encontró un usuario con la razón social ingresada', 'error');
    }
  }

  get nombreCompleto(): string {
    return `${this.usuario.nombre} ${this.usuario.apellido}`.trim();
  }

  calcularOpGravadas(): number {
    const totalProductos = this.detalleProductos.reduce((sum, detalle) => sum + detalle.totalPrice, 0);
    const totalServicios = this.detalleServicios.reduce((sum, detalle) => sum + detalle.price, 0);
    return totalProductos + totalServicios;
  }

  calcularIgv(): number {
    return this.calcularOpGravadas() * 0.18;
  }

  calcularTotal(): number {
    return this.calcularOpGravadas() + this.calcularIgv();
  }

  onTipoBusquedaChange(): void {
    this.usuarioInput = '';
    if (this.tipoBusqueda === 'ruc') {
      this.cotizacionData.usuarioId = '';
      this.usuario = {
        id: '',
        nombre: '',
        apellido: '',
        razonSocial: '',
        ruc: '',
        tipoUsuario: ''
      };
    } else {
      this.usuario = {
        id: '',
        nombre: '',
        apellido: '',
        razonSocial: '',
        ruc: '',
        tipoUsuario: ''
      };
    }
  }

  eliminarCliente(): void {
    this.usuario = {
      id: '',
      nombre: '',
      apellido: '',
      razonSocial: '',
      ruc: '',
      tipoUsuario: ''
    };
    this.usuarioInput = '';
    this.filteredSuggestions = [];
  }
}
