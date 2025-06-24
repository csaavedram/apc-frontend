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

  plazoPagoData: any[] = [];

  plazoPagoTabla: {
    nroCuota: number;
    fechaInicio: string;
    fechaFin: string;
    monto: number;
  }[] = [];

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

  private originalPaymentTermIds: number[] = []; // Store original payment term IDs

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
        .filter(usuario => usuario.tipoUsuario === 'empresa' && usuario.nombre?.toLowerCase().includes(input))
        .map(usuario => usuario.nombre);
      console.log('Filtered suggestions:', this.filteredSuggestions);
    } else {
      this.filteredSuggestions = [];
      console.log('No suggestions found');
    }
  }

  selectSuggestion(suggestion: string): void {
    this.usuarioInput = suggestion;
    this.usuario = this.listaUsuarios.find(
      usuario => usuario.nombre?.toLowerCase() === suggestion.toLowerCase()
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

        this.usuarioInput = cotizacion.user.username;

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
            console.log('Detalles obtenidos:', detalles);            this.detalleProductos = detalles.filter((detalle: any) => detalle.producto !== null).map((detalle: any) => ({
              cotizacionDetalleId: detalle.cotizacionDetalleId,
              productoId: detalle.producto.productoId,
              nombreProducto: detalle.producto.nombreProducto,
              cantidad: detalle.cantidad,
              precioUnitario: detalle.precioUnitario, // Este ya es el precio editado/cotizado
              precioTotal: detalle.precioTotal,
              igv: detalle.igv
            }));

            console.log('Detalles de productos:', this.detalleProductos);

            this.detalleServicios = detalles.filter((detalle: any) => detalle.tipoServicio !== null).map((detalle: any) => ({
              cotizacionDetalleId: detalle.cotizacionDetalleId,
              tipoServicio: detalle.tipoServicio,
              precioTotal: detalle.precioTotal,
              precioUnitario: detalle.precioUnitario,
            }));

            console.log('Detalles de servicios:', this.detalleServicios);

            this.paymentTermService.obtenerPlazosPagoPorCotizacion(this.cotizacionId).subscribe(
              (data: any) => {
                console.log('Plazos de pago obtenidos:', data);
                this.nroPlazos = data.length;
                this.plazoPagoTabla = data.map((plazo: any, index: number) => ({
                  nroCuota: plazo.nroCuota,
                  fechaInicio: plazo.fechaInicio,
                  fechaFin: plazo.fechaFin,
                  monto: plazo.cantidad
                }));

                this.plazoPagoData = data.map((plazo: any) => ({
                  plazaPagoId: plazo.plazoPagoId,
                  nroCuota: plazo.nroCuota,
                  cotizacion: {
                    cotizacionId: plazo.cotizacion.cotizacionId
                  },
                  facturaId: null,
                  fechaInicio: plazo.fechaInicio,
                  fechaFin: plazo.fechaFin,
                  cantidad: plazo.cantidad,
                  estado: plazo.estado
                }));

                this.plazoPagoData = this.plazoPagoData.sort((a, b) => a.nroCuota - b.nroCuota); // Sort by quota number

                this.plazoPagoTabla = this.plazoPagoData.map((plazo) => ({
                  nroCuota: plazo.nroCuota,
                  fechaInicio: plazo.fechaInicio,
                  fechaFin: plazo.fechaFin,
                  monto: plazo.cantidad
                }));

                this.originalPaymentTermIds = data.map((plazo: any) => plazo.plazoPagoId); // Store IDs
              }
            );

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
  agregarDetalleCotizacion(precioUnitario: number, cantidad: number): void {
    if (!this.selectedProduct) {
      this.snack.open('Debe buscar un producto válido antes de agregar un detalle', '', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
      return;
    }

    if (!precioUnitario || isNaN(precioUnitario)) {
      this.snack.open('Debe ingresar un precio unitario válido', '', {
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

    if (precioUnitario < this.selectedProduct.precio) {
      this.snack.open('El precio unitario no puede ser menor que el precio original del producto', '', {
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

      if (existingProduct.precioUnitario !== precioUnitario) {
        this.snack.open(
          `El precio ingresado (${precioUnitario}) es diferente al registrado anteriormente (${existingProduct.precioUnitario}). Debe ser igual.`,
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
      existingProduct.precioTotal = existingProduct.precioUnitario * newTotalQuantity;
      existingProduct.igv = existingProduct.precioUnitario * newTotalQuantity * 0.18; // Correct IGV calculation

      this.snack.open('Cantidad actualizada correctamente', '', {
        duration: 3000,
        panelClass: ['snackbar-success']
      });
    } else {
      const igv = precioUnitario * 0.18; // Correctly calculate IGV as 18% of the unit price

      const detalle = {
        productoId: this.selectedProduct.productoId,
        nombreProducto: this.selectedProduct.nombreProducto,
        cantidad,
        precioUnitario: precioUnitario, // Usar precio cotizado como precio unitario
        precioTotal: precioUnitario * cantidad, // Multiply by quantity for total
        igv: igv * cantidad // Multiply by quantity for total IGV
      };

      this.detalleProductos.push(detalle);

      this.snack.open('Producto agregado al detalle correctamente', '', {
        duration: 3000,
        panelClass: ['snackbar-success']
      });
    }

    this.actualizarPlazoPagoTabla();

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
    }    detalle.cantidad = nuevaCantidad;
    detalle.precioTotal = detalle.precioUnitario * nuevaCantidad;
    detalle.igv = detalle.precioTotal * 0.18;

    this.snack.open('Cantidad actualizada correctamente', '', {
      duration: 3000,
      panelClass: ['snackbar-success']
    });

    this.actualizarPlazoPagoTabla();
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

    this.actualizarPlazoPagoTabla();
  }

  eliminarDetalleProducto(index: number): void {
    this.detalleProductos.splice(index, 1);
    Swal.fire('Eliminado', 'El detalle del producto ha sido eliminado', 'success');
    this.actualizarPlazoPagoTabla();
  }

  eliminarDetalleServicio(index: number): void {
    console.log('Before deleting service:', this.detalleServicios);
    this.detalleServicios.splice(index, 1);
    console.log('After deleting service:', this.detalleServicios);
    Swal.fire('Eliminado', 'El detalle del servicio ha sido eliminado', 'success');
    this.actualizarPlazoPagoTabla();
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
            const originalServiceDetails = originalDetails.filter((d: any) => d.tipoServicio !== null);            // Handle product details
            this.syncDetails(
              originalProductDetails,
              this.detalleProductos,
              'precioUnitario',
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

            // Sync payment terms
            this.syncPaymentTerms(
              originalDetails,
              this.plazoPagoData,
              (term) => this.paymentTermService.agregarPlazoPago(term),
              (term) => this.paymentTermService.actualizarPlazoPago(term),
              (termId) => this.paymentTermService.eliminarPlazoPago(termId)
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
        if (JSON.stringify(original) !== JSON.stringify(current)) {          const updatePayload = {
            cotizacionDetalleId: original.cotizacionDetalleId,
            cantidad: current.cantidad || (current.tipoServicio ? 1 : null),
            precioTotal: current.precioTotal,
            precioUnitario: current.precioUnitario,
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
        console.log(`Adding new detail: ${mapKey}`);        const addPayload = {
          cantidad: current.cantidad || (current.tipoServicio ? 1 : null),
          precioTotal: current.precioTotal,
          precioUnitario: current.precioUnitario,
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

  private syncPaymentTerms(
    originalTerms: any[],
    currentTerms: any[],
    addFn: (term: any) => any,
    updateFn: (term: any) => any,
    deleteFn: (termId: any) => any
  ): void {
    console.log('Original payment terms:', originalTerms);
    console.log('Current payment terms:', currentTerms);

    const originalMap = new Map(originalTerms.map((term) => {
      const mapKey = term.plazoPagoId;
      return [mapKey, term];
    }));

    currentTerms.forEach((current, index) => {
      const mapKey = current.plazoPagoId || `new-${index}`; // Use a unique key for new terms

      const original = originalMap.get(mapKey);

      if (original) {
        if (
          original.fechaInicio !== current.fechaInicio ||
          original.fechaFin !== current.fechaFin ||
          original.cantidad !== current.cantidad ||
          original.estado !== current.estado ||
          original.nroCuota !== current.nroCuota
        ) {
          const updatePayload = {
            plazoPagoId: original.plazoPagoId,
            cantidad: current.cantidad,
            facturaId: current.factura?.facturaId || null,
            cotizacion: { cotizacionId: current.cotizacion.cotizacionId },
            fechaInicio: current.fechaInicio,
            fechaFin: current.fechaFin,
            estado: current.estado,
            nroCuota: current.nroCuota
          };

          updateFn(updatePayload).subscribe(
            () => console.log(`Payment term updated: ${mapKey}`),
            (error: any) => console.error('Error updating payment term:', error)
          );
        }
        originalMap.delete(mapKey);
      } else {
        console.log(`Adding new payment term: ${mapKey}`);
        const addPayload = {
          cantidad: current.cantidad,
          facturaId: current.factura?.facturaId || null,
          cotizacion: { cotizacionId: current.cotizacion.cotizacionId },
          fechaInicio: current.fechaInicio,
          fechaFin: current.fechaFin,
          estado: current.estado,
          nroCuota: current.nroCuota
        };

        addFn(addPayload).subscribe(
          () => console.log(`Payment term added: ${mapKey}`),
          (error: any) => console.error('Error adding payment term:', error)
        );
      }
    });

    originalMap.forEach((original, key) => {
      const isStillPresent = currentTerms.some(
        (current) => current.plazoPagoId && current.plazoPagoId === key
      );

      if (!isStillPresent) {
        console.log(`Deleting outdated payment term: ${key}`, original);
        deleteFn(key).subscribe(
          () => console.log(`Outdated payment term deleted successfully: ${key}`),
          (error: any) => console.error('Error deleting outdated payment term:', error)
        );
      }
    });

    this.originalPaymentTermIds.forEach((id) => {
      const isStillPresent = currentTerms.some(
        (current) => current.plazoPagoId === id
      );

      if (!isStillPresent) {
        console.log(`Deleting outdated payment term: ${id}`);
        deleteFn(id).subscribe(
          () => console.log(`Outdated payment term deleted successfully: ${id}`),
          (error: any) => console.error('Error deleting outdated payment term:', error)
        );
      }
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
    const totalProductos = this.detalleProductos.reduce((sum, detalle) => sum + detalle.precioUnitario * detalle.cantidad * 0.82, 0); // 82% of unit price for products
    const totalServicios = this.detalleServicios.reduce((sum, detalle) => sum + detalle.precioUnitario * 0.82, 0); // 82% of unit price for services
    return totalProductos + totalServicios;
  }
  calcularIgv(): number {
    const totalProductos = this.detalleProductos.reduce((sum, detalle) => sum + detalle.precioUnitario * detalle.cantidad * 0.18, 0); // 18% of unit price for products
    const totalServicios = this.detalleServicios.reduce((sum, detalle) => sum + detalle.precioUnitario * 0.18, 0); // 18% of unit price for services
    return totalProductos + totalServicios;
  }

  calcularTotal(): number {
    return this.detalleProductos.reduce((sum, detalle) => sum + detalle.precioUnitario * detalle.cantidad, 0) +
           this.detalleServicios.reduce((sum, detalle) => sum + detalle.precioUnitario, 0); // Total is the sum of all unit prices
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
    if (this.nroPlazos <= 0) {
      this.snack.open('Debe ingresar minimo 1 nro. de plazo', '', {
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
      if (result && Array.isArray(result)) {
        const total = this.calcularTotal();
        const montoPorPlazo = total / this.nroPlazos;

        this.plazoPagoData = result.map((plazo, index) => ({
          plazaPagoId: null, // IDs are not retained after modal closure
          nroCuota: index + 1, // Sequentially generated
          cotizacion: { cotizacionId: this.cotizacionId },
          factura: null, // Always null
          fechaInicio: plazo.fechaInicio || '',
          fechaFin: plazo.fechaFin || '',
          cantidad: montoPorPlazo, // Calculated based on total and number of terms
          estado: 'pendiente' // Default state
        }));

        this.plazoPagoData = this.plazoPagoData.sort((a, b) => a.nroCuota - b.nroCuota); // Sort by quota number

        this.plazoPagoTabla = this.plazoPagoData.map((plazo) => ({
          nroCuota: plazo.nroCuota,
          fechaInicio: plazo.fechaInicio,
          fechaFin: plazo.fechaFin,
          monto: plazo.cantidad
        }));
      } else {
        console.error('Invalid result from modal:', result);
        this.plazoPagoData = [];
      }

      if(this.calcularTotal() === 0) {
        this.plazoPagoTabla = this.plazoPagoData.map((plazo, index) => ({
          nroCuota: index + 1,
          fechaInicio: plazo.fechaInicio,
          fechaFin: plazo.fechaFin,
          monto: 0
        }));
      } else {        const totalPorPlazo = (this.detalleProductos.length > 0
          ? this.detalleProductos.reduce((sum, detalle) => sum + detalle.precioUnitario * detalle.cantidad, 0)
          : 0) +
          (this.detalleServicios.length > 0
            ? this.detalleServicios.reduce((sum, detalle) => sum + detalle.precioUnitario, 0)
            : 0);

        console.log(this.detalleProductos, this.detalleServicios);

        const montoPorPlazo = totalPorPlazo / this.nroPlazos;
        console.log(totalPorPlazo, montoPorPlazo);
        console.log(this.detalleProductos, this.detalleServicios);
        this.plazoPagoTabla = this.plazoPagoData.map((plazo, index) => ({
          nroCuota: index + 1,
          fechaInicio: plazo.fechaInicio,
          fechaFin: plazo.fechaFin,
          monto: montoPorPlazo
        }));
      }
    });
  }

  actualizarPlazoPagoTabla(): void {
    const total = this.calcularTotal();
    this.plazoPagoTabla.forEach((plazo, index) => {
      const montoPorPlazo = total / this.nroPlazos;
      plazo.monto = montoPorPlazo;
      if (this.plazoPagoData[index]) {
        this.plazoPagoData[index].cantidad = montoPorPlazo;
      }
    });
    console.log(this.plazoPagoTabla);
    console.log(this.plazoPagoData);
  }
}
