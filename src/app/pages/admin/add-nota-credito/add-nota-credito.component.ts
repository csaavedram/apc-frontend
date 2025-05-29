import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterModule } from '@angular/router';
import { FacturaDetailsService } from 'src/app/services/factura-details.service';
import { FacturaService } from 'src/app/services/factura.service';
import { NotaCreditoDetailsService } from 'src/app/services/nota-credito-details.service';
import { NotaCreditoService } from 'src/app/services/nota-credito.service';
import { ProductoService } from 'src/app/services/producto.service';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-nota-credito',
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
    MatNativeDateModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './add-nota-credito.component.html',
  styleUrl: './add-nota-credito.component.css'
})
export class AddNotaCreditoComponent {
  notaData = {
    divisa: '',
    tipoPago: '',
    total: 0.0,
    userId: null,
    tipo: 'bien',
    fechaEmision: null,
    usuarioId: '',
    codigo: '',
    productoId: null,
    nombreEmpresa: '',
    rucEmpresa: '',
  };

  codigoFactura = '';

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
  allDetails: any[] = [];
  selectedProduct: any = null;
  selectedServiceType = { type: '', price: 0 };
  skuChanged: boolean = false;
  items: any[] = [];
  tipoBusqueda = 'ruc';
  listaUsuarios: any[] = [];
  usuarioInput: string = '';
  suggestions: string[] = [];
  filteredSuggestions: string[] = [];

  nombreCliente = '';
  ruc = '';

  busquedaRealizada: boolean = false;
  busquedaExitosa: boolean = false;

  constructor(
    private snack: MatSnackBar,
    private facturaService: FacturaService,
    private facturaDetailsService: FacturaDetailsService,
    private notaCreditoService: NotaCreditoService,
    private notaCreditoDetailService: NotaCreditoDetailsService,
    private productoService: ProductoService,
    private userService: UserService,
    private router: Router,
  ) {}

  buscarFacturaPorCodigo(): void {
    this.busquedaRealizada = true;
    this.busquedaExitosa = false;
    this.detalleProductos = [];
    this.detalleServicios = [];

    const codigo = this.codigoFactura.trim();
    if (!codigo) {
      this.snack.open('Debe ingresar un código de factura válido', '', {
        duration: 3000
      });
      this.busquedaRealizada = false;
      return;
    }

    this.facturaService.obtenerFacturaPorCodigo(codigo).subscribe(
      (factura: any) => {
        this.notaData = {
          ...this.notaData,
          divisa: factura.divisa,
          tipoPago: factura.tipoPago,
          fechaEmision: factura.fechaEmision,
          total: factura.total,
          userId: factura.user.id,
          codigo: factura.codigo
        };
        this.usuario = {
          id: factura.user.id,
          nombre: factura.user.nombre,
          apellido: factura.user.apellido,
          razonSocial: factura.user.razonSocial,
          ruc: factura.user.ruc,
          tipoUsuario: factura.user.tipoUsuario
        };

        this.usuarioInput = this.usuario.ruc
        this.nombreCliente = this.usuario.tipoUsuario === 'cliente_empresa' ? this.usuario.razonSocial : `${this.usuario.nombre} ${this.usuario.apellido}`;
        this.ruc = this.usuario.ruc;

        this.facturaDetailsService.listarFacturaDetailsPorFactura(factura.facturaId).subscribe(
          (detalles: any) => {
            this.allDetails = detalles;
            this.detalleProductos = detalles.filter((detalle: any) => detalle.producto !== null).map((detalle: any) => ({
              facturaDetalleId: detalle.facturaDetalleId,
              productoId: detalle.producto.productoId,
              nombreProducto: detalle.producto.nombreProducto,
              cantidad: detalle.cantidad,
              precioUnitario: detalle.precioUnitario,
              precioTotal: detalle.precioTotal,
              precioNuevo: null
            }));

            console.log(this.detalleProductos)

            this.detalleServicios = detalles.filter((detalle: any) => detalle.tipoServicio !== null).map((detalle: any) => ({
              facturaDetalleId: detalle.facturaDetalleId,
              tipoServicio: detalle.tipoServicio,
              precioTotal: detalle.precioTotal,
              precioUnitario: detalle.precioUnitario
            }));

            this.busquedaRealizada = false;
            this.busquedaExitosa = true;
          },
          (error) => {
            console.error('Error al obtener detalles de la factura:', error);
            this.snack.open('Error al obtener detalles de la factura', '', {
              duration: 3000
            });
            this.busquedaRealizada = false;
            this.busquedaExitosa = false;
          }
        );
        this.snack.open('Factura encontrada', '', {
          duration: 3000
        });
      },
      (error) => {
        console.error('Error al buscar la factura:', error);
        this.snack.open('Error al buscar la factura', '', {
          duration: 3000
        });
        this.busquedaRealizada = false;
        this.busquedaExitosa = false;
      }
    );
  }

  volverANotas() {
    this.router.navigate(['/admin/notascredito']);
  }

  guardarInformacion() {
    console.log(this.notaData);
    console.log(this.detalleProductos);
    console.log(this.detalleServicios);

    if (this.usuario.id === '') {
      this.snack.open('Debe buscar un cliente o empresa por RUC antes de guardar la cotización', '', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
      return;
    }

    if (!this.notaData.divisa) {
      this.snack.open('Debe seleccionar una divisa', '', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
      return;
    }

    if (!this.notaData.tipoPago) {
      this.snack.open('Debe seleccionar un tipo de pago', '', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
      return;
    }

    if (this.detalleProductos.length === 0 && this.detalleServicios.length === 0) {
      Swal.fire('Error', 'Debe agregar al menos un detalle de producto o servicio', 'error');
      return;
    }

    const notaPayload = {
      divisa: this.notaData.divisa,
      tipoPago: this.notaData.tipoPago,
      total: this.calcularTotal(),
      user: {
        id: this.usuario.id,
      },
      estado: 'Creado',
      fechaEmision: new Date(),
    };

    this.notaCreditoService.agregarNotaCredito(notaPayload).subscribe(
      (nota: any) => {
        const notaId = nota.notaCreditoId;

        this.detalleProductos.forEach((detalle) => {
          const detalleProductoPayload = {
            cantidad: detalle.cantidad,
            precioTotal: detalle.precioTotal,
            precioUnitario: detalle.precioUnitario,
            tipoServicio: null,
            producto: { productoId: detalle.productoId },
            notaCredito: { notaCreditoId: notaId },
            createdAt: new Date()
          };

          this.notaCreditoDetailService.agregarNotaCreditoDetail(detalleProductoPayload).subscribe(
            () => console.log('Detalle de producto guardado'),
            (error) => console.error('Error al guardar detalle de producto:', error)
          );
        });

        this.detalleServicios.forEach((detalle) => {
          const detalleServicioPayload = {
            cantidad: 1,
            precioTotal: detalle.precioTotal,
            precioUnitario: detalle.precioUnitario,
            precioNuevo: null,
            tipoServicio: detalle.tipoServicio,
            productoId: null,
            notaCredito: { notaCreditoId: notaId },
            createdAt: new Date(),
          };

          this.notaCreditoDetailService.agregarNotaCreditoDetail(detalleServicioPayload).subscribe(
            () => console.log('Detalle de servicio guardado'),
            (error) => console.error('Error al guardar detalle de servicio:', error)
          );
        });

        Swal.fire('Éxito', 'La nota de credito y sus detalles han sido guardados correctamente', 'success')
          .then(() => {
            this.router.navigate(['/admin/notascredito']);
          });
      },
      (error) => {
        console.error('Error al guardar la cotización:', error);
        Swal.fire('Error', 'Ocurrió un error al guardar la cotización', 'error');
      }
    );
  }

  onTipoBusquedaChange(): void {
    this.usuarioInput = '';
    if (this.tipoBusqueda === 'ruc') {
      this.notaData.usuarioId = '';
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

  getPrecioUnitarioPorProductoId(productoId: string): number {
    const detalle = this.productos.find((d: any) => d.productoId === productoId);
    return detalle ? detalle.precio : 0;
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
    if (this.notaData.tipo === 'bien') {
      this.items = this.productos;
    } else {
      this.items = this.servicios;
    }
  }

  onTipoChange(): void {
    const preservedDivisa = this.notaData.divisa;
    const preservedTipoPago = this.notaData.tipoPago;

    this.selectedProduct = null;
    this.selectedServiceType = { type: '', price: 0 };

    this.actualizarItems();

    this.notaData.divisa = preservedDivisa;
    this.notaData.tipoPago = preservedTipoPago;
  }

  buscarProductoPorSku(): void {
    const skuBuscado = this.notaData.productoId;
    const productoEncontrado = this.productos.find((producto) => producto.sku === skuBuscado);

    if (!productoEncontrado) {
      Swal.fire('Producto no encontrado', 'El SKU que has ingresado no está registrado en productos', 'error');
      this.selectedProduct = null;
      return;
    }

    const existingProductIndex = this.detalleProductos.findIndex(
      (detalle) => detalle.productoId === productoEncontrado.productoId
    );

    if (existingProductIndex !== -1) {
      this.snack.open('Este producto ya se encuentra en el detalle', '', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
      return;
    }

    this.skuChanged = true;
    this.selectedProduct = { ...productoEncontrado };
  }

  agregarDetalleFactura(newPrice: number, cantidad: number): void {
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
    const igv = newPrice * cantidad * 0.18;

    const detalle = {
      productoId: this.selectedProduct.productoId,
      nombreProducto: this.selectedProduct.nombreProducto,
      cantidad,
      precioUnitario: newPrice,
      precioTotal: newPrice * cantidad,
      igv,
    };

    this.detalleProductos.push(detalle);

    this.snack.open('Producto agregado al detalle correctamente', '', {
      duration: 3000,
      panelClass: ['snackbar-success']
    });

    this.selectedProduct = null;
    this.notaData.productoId = null;
  }

  agregarDetalleServicio(price: number): void {
    if (!this.selectedServiceType.type) {
      Swal.fire('Error', 'Debe seleccionar un tipo de servicio', 'error');
      return;
    }

    if (price < 0) {
      Swal.fire('Error', 'El precio no puede ser menor a 0', 'error');
      return;
    }

    const detalle = {
      tipoServicio: this.selectedServiceType.type,
      precioUnitario: price
    };

    this.detalleServicios.push(detalle);
    Swal.fire('Detalle agregado', 'El detalle de servicio ha sido agregado', 'success');
    this.selectedServiceType = { type: '', price: 0 };
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
          Swal.fire('No encontrado', 'No se encontró un cliente o empresa por RUC ingresado', 'error');
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

  eliminarDetalleProducto(index: number): void {
    this.detalleProductos.splice(index, 1);
    Swal.fire('Eliminado', 'El detalle del producto ha sido eliminado', 'success');
  }

  eliminarDetalleServicio(index: number): void {
    this.detalleServicios.splice(index, 1);
    Swal.fire('Eliminado', 'El detalle del servicio ha sido eliminado', 'success');
  }

  get nombreCompleto(): string {
    return `${this.usuario.nombre} ${this.usuario.apellido}`.trim();
  }

  calcularOpGravadas(): number {
    const totalProductos = this.detalleProductos.reduce((sum, detalle) => sum + detalle.precioUnitario * detalle.cantidad * 0.82, 0);
    const totalServicios = this.detalleServicios.reduce((sum, detalle) => sum + detalle.precioUnitario * 0.82, 0);
    return totalProductos + totalServicios;
  }

  calcularIgv(): number {
    const totalProductos = this.detalleProductos.reduce((sum, detalle) => sum + detalle.precioUnitario * detalle.cantidad * 0.18, 0);
    const totalServicios = this.detalleServicios.reduce((sum, detalle) => sum + detalle.precioUnitario * 0.18, 0);
    return totalProductos + totalServicios;
  }

  calcularTotal(): number {
    return this.detalleProductos.reduce((sum, detalle) => sum + detalle.precioUnitario * detalle.cantidad, 0) +
           this.detalleServicios.reduce((sum, detalle) => sum + detalle.precioUnitario, 0);
  }

  actualizarCantidad(index: number, nuevaCantidad: number): void {
    const detalle = this.detalleProductos[index];
    const producto = this.productos.find((p) => p.productoId === detalle.productoId);

    if (!producto) {
      this.snack.open('Producto no encontrado en el inventario', '', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
      return;
    }

    if (nuevaCantidad < 1) {
      this.snack.open('La cantidad no puede ser menor a 1', '', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
      detalle.cantidad = 1;
      return;
    }

    if (nuevaCantidad > producto.stock) {
      this.snack.open(`La cantidad no puede ser mayor al stock disponible (${producto.stock})`, '', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
      detalle.cantidad = producto.stock;
      return;
    }

    detalle.cantidad = nuevaCantidad;
    detalle.precioTotal = detalle.precioUnitario * nuevaCantidad;
    detalle.igv = detalle.precioTotal * 0.18;

    this.snack.open('Cantidad actualizada correctamente', '', {
      duration: 3000,
      panelClass: ['snackbar-success']
    });
  }
}
