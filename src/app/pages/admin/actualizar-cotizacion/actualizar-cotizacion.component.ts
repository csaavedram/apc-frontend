import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AddPlazosPagoComponent } from 'src/app/components/modal/add-plazos-pago/add-plazos-pago.component';
import { MatDialog } from '@angular/material/dialog';
import { PaymentTermService } from 'src/app/services/payment-term.service';

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
    MatNativeDateModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './actualizar-cotizacion.component.html',
  styleUrls: ['./actualizar-cotizacion.component.css']
})
export class ActualizarCotizacionComponent {
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
    ruc: '',
    estado: '',
    codigo: '',
    createdAt: '',
  };

  usuario = {
    id: '',
    nombre: '',
    apellido: '',
    razonSocial: '',
    ruc: '',
    tipoUsuario: ''
  };

  plazoPagoData = {
    fechaInicio: '',
    fechaFin: ''
  }

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
  usuarioInput: string = '';
  suggestions: string[] = [];
  filteredSuggestions: string[] = [];
  cotizacionId: any = null;
  nombreCompleto: string = '';
  loading = false;

  nroPlazos: number = 0;

  constructor(
    private snack: MatSnackBar,
    private productoService: ProductoService,
    private route: ActivatedRoute,
    private quotationService: QuotationService,
    private paymentTermService: PaymentTermService,
    private quotationDetailsService: QuotationDetailsService,
    private userService: UserService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  onUsuarioInputChange(): void {
    const input = this.usuarioInput.trim().toLowerCase();
    if (this.tipoBusqueda === 'razon_social' && input.length > 0) {
      this.filteredSuggestions = this.listaUsuarios
        .filter(usuario => usuario.razonSocial?.toLowerCase().includes(input))
        .map(usuario => usuario.razonSocial || '');
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
    this.loading = true;
    this.listarProductos();
    this.listarUsuarios();
    this.cotizacionId = this.route.snapshot.params['cotizacionId'];
    this.quotationService.obtenerQuotation(this.cotizacionId).subscribe(
      (cotizacion: any) => {
        console.log('Cotización obtenida:', cotizacion);
        this.cotizacionData = {
          divisa: cotizacion.divisa,
          tipoPago: cotizacion.tipoPago,
          plazoEntrega: cotizacion.plazoEntrega,
          validezOferta: cotizacion.validezOferta,
          total: cotizacion.total,
          userId: cotizacion.user.id,
          tipo: 'bien',
          productoId: null,
          usuarioId: cotizacion.user.id,
          ruc: cotizacion.user.ruc,
          estado: cotizacion.estado,
          codigo: cotizacion.codigo,
          createdAt: cotizacion.createdAt
        };

        this.usuarioInput = cotizacion.user.ruc;

        // Set user data
        this.usuario = {
          id: cotizacion.user.id,
          nombre: cotizacion.user.nombre,
          apellido: cotizacion.user.apellido,
          razonSocial: cotizacion.user.razonSocial,
          ruc: cotizacion.user.ruc,
          tipoUsuario: cotizacion.user.tipoUsuario
        };

        // Dynamically update nombreCompleto
        this.nombreCompleto = `${this.usuario.nombre} ${this.usuario.apellido}`.trim();

        // List quotation details
        this.quotationDetailsService.listarQuotationsDetailsByQuotation(this.cotizacionId).subscribe(
          (detalles: any) => {
            this.detalleProductos = detalles.filter((detalle: any) => detalle.producto !== null).map((detalle: any) => ({
              cotizacionDetalleId: detalle.cotizacionDetalleId,
              productoId: detalle.producto.productoId,
              nombreProducto: detalle.producto.nombreProducto,
              cantidad: detalle.cantidad,
              precioUnitario: detalle.precioUnitario,
              precioNuevo: detalle.precioNuevo,
              precioTotal: detalle.precioTotal,
              igv: detalle.igv
            }));

            this.detalleServicios = detalles.filter((detalle: any) => detalle.tipoServicio !== null).map((detalle: any) => ({
              cotizacionDetalleId: detalle.cotizacionDetalleId, // Incluye el ID del detalle
              tipoServicio: detalle.tipoServicio,
              precioTotal: detalle.precioTotal,
              precioUnitario: detalle.precioUnitario,
            }));
            this.loading = false;
          },
          (error) => {
            console.error('Error al obtener detalles de la cotización:', error);
            this.snack.open('Error al obtener detalles de la cotización', '', {
              duration: 3000
            });
            this.loading = false;
          }
        );
      },
      (error) => {
        console.error('Error al obtener cotización:', error);
        this.snack.open('Error al obtener cotización', '', {
          duration: 3000
        });
        this.loading = false;
      }
    );
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
  }

  onTipoChange(): void {
    const preservedDivisa = this.cotizacionData.divisa;
    const preservedTipoPago = this.cotizacionData.tipoPago;

    this.selectedProduct = null;
    this.selectedServiceType = { type: '', price: 0 };

    this.actualizarItems();

    this.cotizacionData.divisa = preservedDivisa;
    this.cotizacionData.tipoPago = preservedTipoPago;
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

  agregarDetalleCotizacion(precioNuevo: number, cantidad: number): void {
    if (!this.selectedProduct) {
      this.snack.open('Debe buscar un producto válido antes de agregar un detalle', '', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
      return;
    }

    if (!precioNuevo || isNaN(precioNuevo)) {
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

    if (precioNuevo < this.selectedProduct.precio) {
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

      if (existingProduct.precioNuevo !== precioNuevo) {
        this.snack.open(
          `El precio ingresado (${precioNuevo}) es diferente al registrado anteriormente (${existingProduct.precioNuevo}). Debe ser igual.`,
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
      existingProduct.precioTotal = existingProduct.precioNuevo * newTotalQuantity;
      existingProduct.igv = existingProduct.precioNuevo * newTotalQuantity * 0.18; // Correct IGV calculation

      this.snack.open('Cantidad actualizada correctamente', '', {
        duration: 3000,
        panelClass: ['snackbar-success']
      });
    } else {
      const igv = precioNuevo * 0.18; // Correctly calculate IGV as 18% of the new price

      const detalle = {
        productoId: this.selectedProduct.productoId,
        nombreProducto: this.selectedProduct.nombreProducto,
        cantidad,
        precioUnitario: this.selectedProduct.precio,
        precioNuevo,
        precioTotal: precioNuevo * cantidad, // Multiply by quantity for total
        igv: igv * cantidad // Multiply by quantity for total IGV
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
      detalle.cantidad = 1; // Reset to minimum valid quantity
      return;
    }

    if (nuevaCantidad > producto.stock) {
      this.snack.open(`La cantidad no puede ser mayor al stock disponible (${producto.stock})`, '', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
      detalle.cantidad = producto.stock; // Reset to maximum valid quantity
      return;
    }

    detalle.cantidad = nuevaCantidad;
    detalle.precioTotal = detalle.precioNuevo * nuevaCantidad;
    detalle.igv = detalle.precioTotal * 0.18;

    this.snack.open('Cantidad actualizada correctamente', '', {
      duration: 3000,
      panelClass: ['snackbar-success']
    });
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
      precioTotal: price,
      precioUnitario: price,
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
    console.log('Before deleting service:', this.detalleServicios);
    this.detalleServicios.splice(index, 1);
    console.log('After deleting service:', this.detalleServicios);
    Swal.fire('Eliminado', 'El detalle del servicio ha sido eliminado', 'success');
  }

  volverACategorias() {
    this.router.navigate(['/admin/cotizaciones']);
  }

  guardarInformacion(): void {
    if (this.usuario.id === '') {
      this.snack.open('Debe buscar un cliente o empresa por RUC antes de guardar la cotización', '', {
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
      cotizacionId: this.cotizacionId,
      divisa: this.cotizacionData.divisa,
      tipoPago: this.cotizacionData.tipoPago,
      plazoEntrega: this.cotizacionData.plazoEntrega,
      validezOferta: this.cotizacionData.validezOferta,
      total: this.calcularTotal(),
      user: {
        id: this.usuario.id,
      },
      estado: this.cotizacionData.estado,
      codigo: this.cotizacionData.codigo,
      createdAt: this.cotizacionData.createdAt
    };

    // Update the quotation
    this.quotationService.actualizarQuotation(cotizacionPayload).subscribe(
      () => {
        // Fetch original details to compare
        this.quotationDetailsService.listarQuotationsDetailsByQuotation(this.cotizacionId).subscribe(
          (originalDetails: any) => {
            const originalProductDetails = originalDetails.filter((d: any) => d.producto !== null);
            const originalServiceDetails = originalDetails.filter((d: any) => d.tipoServicio !== null);

            // Handle product details
            this.syncDetails(
              originalProductDetails,
              this.detalleProductos,
              'precioNuevo',
              (detail) => this.quotationDetailsService.agregarQuotationDetail(detail),
              (detail) => this.quotationDetailsService.actualizarQuotationDetail(detail),
              (detailId) => this.quotationDetailsService.eliminarQuotationDetail(detailId)
            );

            // Handle service details
            this.syncDetails(
              originalServiceDetails,
              this.detalleServicios,
              'tipoServicio',
              (detail) => this.quotationDetailsService.agregarQuotationDetail(detail),
              (detail) => this.quotationDetailsService.actualizarQuotationDetail(detail),
              (detailId) => this.quotationDetailsService.eliminarQuotationDetail(detailId)
            );

            Swal.fire('Éxito', 'La cotización y sus detalles han sido actualizados correctamente', 'success')
              .then(() => {
                this.router.navigate(['/admin/cotizaciones']);
              });
          },
          (error) => {
            console.error('Error al obtener detalles originales:', error);
            this.snack.open('Error al obtener detalles originales', '', {
              duration: 3000,
              panelClass: ['snackbar-error']
            });
          }
        );
      },
      (error) => {
        console.error('Error al actualizar la cotización:', error);
        Swal.fire('Error', 'Ocurrió un error al actualizar la cotización', 'error');
      }
    );
  }

  // Helper method to sync details
  private syncDetails(
    originalDetails: any[],
    currentDetails: any[],
    key: string,
    addFn: (detail: any) => any,
    updateFn: (detail: any) => any,
    deleteFn: (detailId: any) => any
  ): void {
    console.log('Original details:', originalDetails);
    console.log('Current details:', currentDetails);

    const originalMap = new Map(originalDetails.map((d) => {
      const mapKey = d.cotizacionDetalleId;
      return [mapKey, d];
    }));

    currentDetails.forEach((current) => {
      const mapKey = current.cotizacionDetalleId;

      const original = originalMap.get(mapKey);

      if (original) {
        if (JSON.stringify(original) !== JSON.stringify(current)) {

          const updatePayload = {
            cotizacionDetalleId: original.cotizacionDetalleId,
            cantidad: current.cantidad || (current.tipoServicio ? 1 : null),
            precioTotal: current.precioTotal,
            precioUnitario: current.precioUnitario,
            precioNuevo: current.precioNuevo,
            producto: current.productoId ? { productoId: current.productoId } : null,
            tipoServicio: current.tipoServicio || null,
            cotizacion: { cotizacionId: this.cotizacionId },
            createdAt: original.createdAt
          };

          updateFn(updatePayload).subscribe(
            () => console.log(`Detalle actualizado: ${mapKey}`),
            (error: any) => console.error('Error al actualizar detalle:', error)
          );
        }
        originalMap.delete(mapKey);
      } else {
        console.log(`Adding new detail: ${mapKey}`);
        const addPayload = {
          cantidad: current.cantidad || (current.tipoServicio ? 1 : null),
          precioTotal: current.precioTotal,
          precioUnitario: current.precioUnitario,
          precioNuevo: current.precioNuevo,
          producto: current.productoId ? { productoId: current.productoId } : null,
          tipoServicio: current.tipoServicio || null,
          cotizacion: { cotizacionId: this.cotizacionId },
          createdAt: new Date().toISOString()
        };

        addFn(addPayload).subscribe(
          () => console.log(`Detalle agregado: ${mapKey}`),
          (error: any) => console.error('Error al agregar detalle:', error)
        );
      }
    });

    // Eliminar los detalles que no están en los detalles actuales
    originalMap.forEach((original) => {
      console.log(`Deleting detail: ${original.cotizacionDetalleId}`, original);
      deleteFn(original.cotizacionDetalleId).subscribe(
        () => console.log(`Detail deleted successfully: ${original.cotizacionDetalleId}`),
        (error: any) => console.error('Error deleting detail:', error)
      );
    });
  }

  getCurrentDate(): string {
    const currentDate = new Date();
    return currentDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  }

  buscarClientePorRuc(): void {
    const ruc = this.usuarioInput;

    if (!ruc.trim()) {
      Swal.fire('Error', 'Debe ingresar un RUC válido', 'error');
      return;
    }

    this.userService.obtenerUsuarioPorRuc(ruc).subscribe(
      (usuario: any) => {
        console.log(usuario)
        if (usuario) {
          this.usuario = usuario;
        } else {
          Swal.fire('No encontrado', 'No se encontró un cliente o empresa por RUC ingresado', 'error');
        }
      },
      (error: any) => {
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

  calcularOpGravadas(): number {
    const totalProductos = this.detalleProductos.reduce((sum, detalle) => sum + detalle.precioNuevo * detalle.cantidad * 0.82, 0); // 82% of new price for products
    const totalServicios = this.detalleServicios.reduce((sum, detalle) => sum + detalle.precioTotal * 0.82, 0); // 82% of total price for services
    return totalProductos + totalServicios;
  }

  calcularIgv(): number {
    const totalProductos = this.detalleProductos.reduce((sum, detalle) => sum + detalle.precioNuevo * detalle.cantidad * 0.18, 0); // 18% of new price for products
    const totalServicios = this.detalleServicios.reduce((sum, detalle) => sum + detalle.precioTotal * 0.18, 0); // 18% of total price for services
    return totalProductos + totalServicios;
  }

  calcularTotal(): number {
    return this.detalleProductos.reduce((sum, detalle) => sum + detalle.precioNuevo * detalle.cantidad, 0) +
           this.detalleServicios.reduce((sum, detalle) => sum + detalle.precioTotal, 0); // Total is the sum of all new prices
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

  buscarPlazos(): void {
    if (this.nroPlazos <= 1) {
      this.snack.open('Debe ingresar mínimo 2 nros. de plazos', '', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
      return;
    }

    const dialogRef = this.dialog.open(AddPlazosPagoComponent, {
      width: '500px',
      data: { cantidadPlazos: this.nroPlazos },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.plazoPagoData = result;
      }
    });
  }
}
