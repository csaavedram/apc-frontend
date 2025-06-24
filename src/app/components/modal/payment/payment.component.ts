import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PaymentService } from '../../../services/mercado-pago.service';
import { PaymentTermService } from 'src/app/services/payment-term.service';
import { FacturaService } from 'src/app/services/factura.service';
import { FacturaDetailsService } from 'src/app/services/factura-details.service';
import { MatDialogRef } from '@angular/material/dialog';
import { OrdersService } from 'src/app/services/orders.service';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Inject } from '@angular/core';
import { OrdenCotizacionService } from 'src/app/services/orden-cotizacion.service';
import { QuotationService } from 'src/app/services/quotation.service';
import { QuotationDetailsService } from 'src/app/services/quotation-details.service';
import { LoginService } from 'src/app/services/login.service';
import { InventarioService } from 'src/app/services/inventario.service';
import { ProductoService } from 'src/app/services/producto.service';
import { ProductoSerieService } from 'src/app/services/producto-serie.service';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css'],
})
export class PaymentComponent implements OnInit {
  private mp: any;
  user: any = null;
  email: string = '';
  cotizacion: any = [];
  cantidadPorPlazo: number = 0;
  cantidadPlazos: number = 0;

  loading = false;
  constructor(
    private dialogRef: MatDialogRef<PaymentComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { orderId: number, nroCuota: number, plazoPago: any },
    private paymentService: PaymentService,
    private facturaService: FacturaService,
    private facturaDetailsService: FacturaDetailsService,
    private plazosPagoService: PaymentTermService,
    private ordersService: OrdersService,
    private cotizacionDetailsService: QuotationDetailsService,
    private ordenCotizacionService: OrdenCotizacionService,
    private loginService: LoginService,
    private cotizacionService: QuotationService,
    private inventarioService: InventarioService,
    private productoService: ProductoService,
    private productoSerieService: ProductoSerieService
  ) {}
  async ngOnInit() {
    this.loading = true;
    this.user = this.loginService.getUser();
    
    this.ordenCotizacionService.obtenerOrdenCotizacionPorOrderId(this.data.orderId).subscribe(
      (ordenCotizacion: any) => {
        console.log('📋 Orden cotización obtenida:', ordenCotizacion);
        this.cotizacion = ordenCotizacion[0].cotizacion;
        console.log('💰 Cotización cargada:', this.cotizacion);
        console.log('💵 Total de cotización:', this.cotizacion.total);
        
        this.plazosPagoService.obtenerPlazosPagoPorCotizacion(this.cotizacion.cotizacionId).subscribe(
          (plazosPago: any) => {
            console.log('📊 Plazos de pago obtenidos:', plazosPago);
            if (this.cotizacion.tipoPago === 'Credito') {
              this.cantidadPlazos = plazosPago.length;
              this.cantidadPorPlazo = plazosPago[0].cantidad;
              console.log(`💳 Crédito - Plazos: ${this.cantidadPlazos}, Cantidad por plazo: ${this.cantidadPorPlazo}`);
            }
            this.initializeBrick();
          },
          (error) => {
            console.error('❌ Error obteniendo plazos de pago:', error);
            this.loading = false;
          }
        );
      },
      (error: any) => {
        console.error('❌ Error obteniendo orden de cotización:', error);
        this.loading = false;
      }
    );
  }

  async initializeBrick() {
    try {
      this.mp = await this.paymentService.initializeMercadoPago();
      const bricksBuilder = this.mp.bricks();

      const amountToPay = this.cantidadPorPlazo || this.cotizacion.total;

      const settings = {
        initialization: {
          amount: amountToPay,
          payer: {
            email: ''
          }
        },
        customization: {
          visual: {
            style: {
              theme: 'default',
            },
          },
          paymentMethods: {
            maxInstallments: 1,
          },
        },
        callbacks: {
          onReady: () => {
            this.loading = false;
            console.log('✅ Brick listo');
          },
          onSubmit: (cardFormData: any) => {
            return new Promise((resolve, reject) => {
              try {
                this.sendPayment(cardFormData);
                resolve('Pago procesado correctamente');
              } catch (error) {
                console.error('❌ Error en el pago:', error);
                console.log(error)
                reject(error);
              }
            });
          },
          onError: (error: any) => {
            console.error('❌ Error en el Brick:', error);
            if (error?.message || error?.cause) {
              console.error('📩 Detalles:', JSON.stringify(error, null, 2));
            }
          },
        },
      };

      bricksBuilder.create('cardPayment', 'cardPaymentBrick_container', settings).then(() => {
        console.log('✅ Brick creado exitosamente');
      }).catch((error: any) => {
        console.error('❌ Error creando el Brick:', error);
      });
    } catch (error) {
      console.error('❌ Error inicializando MercadoPago:', error);
      this.loading = false;
    }
  }
  closeModel() {
    this.dialogRef.close();
  }
  addFactura(facturaPayload: any) {
    console.log('🧾 Creando factura con payload:', facturaPayload);
    console.log('💰 Total en payload:', facturaPayload.total);
    
    this.facturaService.agregarFactura(facturaPayload).subscribe(
      (factura: any) => {
        console.log('✅ Factura creada exitosamente:', factura);
        console.log('🆔 ID de factura creada:', factura.facturaId);
        this.cotizacionDetailsService.listarQuotationsDetailsByQuotation(this.cotizacion.cotizacionId).subscribe(
          (cotizacionDetail: any) => {
            console.log('📋 Detalles de cotización obtenidos para factura:', cotizacionDetail);
            console.log('📊 Número de detalles:', cotizacionDetail.length);
              // Usar el método correcto que maneja todo de forma asíncrona
            this.procesarDetallesFacturaCompleto(cotizacionDetail, factura)
              .then(() => {
                console.log('✅ Todos los detalles procesados correctamente en addFactura');
              })
              .catch((error) => {
                console.error('❌ Error procesando detalles en addFactura:', error);
              });
          },
          (error: any) => {
            console.error('❌ Error obteniendo detalles de la cotización:', error);
          }
        );
      },
      (err: any) => {
        console.error('❌ Error creando factura:', err);
        console.error('📄 Payload que falló:', facturaPayload);
      }
    );
  }

  addFacturaAsync(facturaPayload: any): Promise<any> {
    console.log('🧾 Creando factura ASYNC con payload:', facturaPayload);
    console.log('💰 Total en payload:', facturaPayload.total);
    
    return new Promise((resolve, reject) => {
      this.facturaService.agregarFactura(facturaPayload).subscribe(
        (factura: any) => {
          console.log('✅ Factura creada exitosamente:', factura);
          console.log('🆔 ID de factura creada:', factura.facturaId);
          
          this.cotizacionDetailsService.listarQuotationsDetailsByQuotation(this.cotizacion.cotizacionId).subscribe(
            (cotizacionDetail: any) => {
              console.log('📋 Detalles de cotización obtenidos para factura:', cotizacionDetail);
              console.log('📊 Número de detalles:', cotizacionDetail.length);
              
              // Procesar todos los detalles y esperar a que terminen
              this.procesarDetallesFacturaCompleto(cotizacionDetail, factura)
                .then(() => {
                  console.log('✅ Todos los detalles de factura procesados');
                  resolve(factura);
                })
                .catch((error) => {
                  console.error('❌ Error procesando detalles de factura:', error);
                  reject(error);
                });
            },
            (error: any) => {
              console.error('❌ Error obteniendo detalles de la cotización:', error);
              reject(error);
            }
          );
        },
        (err: any) => {
          console.error('❌ Error creando factura:', err);
          console.error('📄 Payload que falló:', facturaPayload);
          reject(err);
        }
      );
    });
  }  sendPayment(data: any) {
    console.log('💳 === INICIANDO ENVÍO DE PAGO ===');
    console.log('📦 Data recibida del brick:', data);

    // Validar datos antes de crear el payload
    if (!data.token) {
      console.error('❌ Error: Token no está presente en data');
      return;
    }
    
    // Validar formato del token
    if (data.token.length < 30) {
      console.error('❌ Error: Token parece ser inválido (muy corto):', data.token);
      return;
    }
    
    if (!data.transaction_amount || data.transaction_amount <= 0) {
      console.error('❌ Error: Monto inválido:', data.transaction_amount);
      return;
    }
    
    if (!data.payer || !data.payer.email) {
      console.error('❌ Error: Email del pagador no está presente');
      return;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.payer.email)) {
      console.error('❌ Error: Email con formato inválido:', data.payer.email);
      return;
    }    const payload = {
      description: 'Pago aprobado',
      installments: data.installments || 1,
      currency_id: 'PEN', // Moneda de Perú
      payer: {
        email: data.payer.email,
        identification: {
          type: data.payer.identification.type,
          number: data.payer.identification.number,
        },
      },
      token: data.token,
      transaction_amount: data.transaction_amount,
      payment_method_id: data.payment_method_id,
    };    console.log('📤 Payload que se enviará al backend:');
    console.log('- Description:', payload.description);
    console.log('- Installments:', payload.installments);
    console.log('- Currency ID:', payload.currency_id);
    console.log('- Payer Email:', payload.payer.email);
    console.log('- Identification Type:', payload.payer.identification.type);
    console.log('- Identification Number:', payload.payer.identification.number);
    console.log('- Token:', payload.token);
    console.log('- Transaction Amount:', payload.transaction_amount);
    console.log('- Payment Method ID:', payload.payment_method_id);
    console.log('📦 Payload completo:', JSON.stringify(payload, null, 2));

    console.log('🚀 Enviando al backend...');

    this.paymentService.createPayment(payload).subscribe(
      async (response: any) => {
        console.log('✅ Pago exitoso:', response);

        const promises = [];

        if (this.cotizacion.tipoPago === 'Credito') {
          if (this.data.nroCuota === 1) {
            promises.push(this.ordersService.pagarParcialmenteOrder(this.data.orderId).toPromise());
            promises.push(this.cotizacionService.pagarParcialmenteCotizacion(this.cotizacion.cotizacionId).toPromise());            const facturaPayload = {
              divisa: this.cotizacion.divisa,
              tipoPago: this.cotizacion.tipoPago,
              total: this.cotizacion.total,
              user: { id: this.user.id },
              fechaEmision: new Date(),
              estado: 'Pagado',
              cotizacion: { cotizacionId: this.cotizacion.cotizacionId },
            };
            promises.push(this.addFacturaAsync(facturaPayload));

            promises.push(this.plazosPagoService.cambiarEstadoAPagado(this.data.plazoPago.plazoPagoId).toPromise());
          }

          if (this.data.nroCuota > 1 && this.data.nroCuota < this.cantidadPlazos) {
            promises.push(this.plazosPagoService.cambiarEstadoAPagado(this.data.plazoPago.plazoPagoId).toPromise());
          }

          if (this.cantidadPlazos === this.data.nroCuota) {
            promises.push(this.ordersService.pagarOrder(this.data.orderId).toPromise());
            promises.push(this.cotizacionService.pagarCotizacion(this.cotizacion.cotizacionId).toPromise());
            promises.push(this.plazosPagoService.cambiarEstadoAPagado(this.data.plazoPago.plazoPagoId).toPromise());          }
        }
        
        if (this.cotizacion.tipoPago === 'Contado') {
          promises.push(this.ordersService.pagarOrder(this.data.orderId).toPromise());
          promises.push(this.cotizacionService.pagarCotizacion(this.cotizacion.cotizacionId).toPromise());          const facturaPayload = {
            divisa: this.cotizacion.divisa,
            tipoPago: this.cotizacion.tipoPago,
            total: this.cotizacion.total, // Usar el total de la cotización, no cantidadPorPlazo
            user: { id: this.user.id },
            fechaEmision: new Date(),
            estado: 'Pagado',
            cotizacion: { cotizacionId: this.cotizacion.cotizacionId },
          };
          promises.push(this.addFacturaAsync(facturaPayload));
        }        await Promise.all(promises);
        console.log('✅ Todas las operaciones completadas');
        
        // Cerrar modal después del pago exitoso
        console.log('✅ Pago y operaciones completadas exitosamente');
        this.closeModel();
      },
      (error: any) => {
        console.error('❌ Error en el pago MP:', error);
      }
    );
  }
  procesarVentaSeriesYCrearDetalles(cotizacionDetail: any[], factura: any) {
    console.log('🔄 Procesando venta y creando detalles de factura');
    console.log('📋 Factura recibida:', factura);
    console.log('📦 Detalles de cotización recibidos:', cotizacionDetail);
    
    const productosConCantidad = cotizacionDetail
      .filter((detalle: any) => detalle.producto !== null)
      .map((detalle: any) => ({
        producto: detalle.producto,
        cantidad: detalle.cantidad,
        precioUnitario: detalle.precioUnitario,
        precioTotal: detalle.precioTotal
      }));

    console.log('🛍️ Productos a procesar:', productosConCantidad);

    productosConCantidad.forEach((item: any) => {
      console.log(`📦 Procesando producto: ${item.producto.nombreProducto}, cantidad: ${item.cantidad}`);
      
      this.productoSerieService.obtenerSeriesPorProducto(item.producto.productoId).subscribe(
        (series: any[]) => {
          console.log(`📋 Series disponibles para ${item.producto.nombreProducto}:`, series);
          
          const seriesDisponibles = series.filter((serie: any) => serie.estado === 'Disponible');
          const seriesTomadas = seriesDisponibles.slice(0, item.cantidad);
          
          if (seriesTomadas.length < item.cantidad) {
            console.warn(`⚠️ Solo hay ${seriesTomadas.length} series disponibles de ${item.cantidad} solicitadas para ${item.producto.nombreProducto}`);
          }
            const numerosSerie = seriesTomadas.map((serie: any) => serie.numeroSerie).join(', ');
          console.log(`🔢 Números de serie asignados: ${numerosSerie}`);
          
          // Crear detalle de factura con números de serie
          const detalleFactura = {
            cantidad: item.cantidad,
            precioTotal: item.precioTotal,
            precioUnitario: item.precioUnitario,
            numerosSerie: numerosSerie,
            tipoServicio: null,
            producto: { productoId: item.producto.productoId },
            factura: { facturaId: factura.facturaId },            createdAt: new Date().toISOString() // Convertir a string para compatibilidad
          };
          
          console.log('💾 Guardando detalle de factura:', detalleFactura);
          
          this.facturaDetailsService.agregarFacturaDetail(detalleFactura).subscribe(
            (response) => {
              console.log('✅ Detalle de factura guardado correctamente:', response);
              
              // Actualizar estado de las series a "Vendido"
              seriesTomadas.forEach((serie: any) => {
                const serieActualizada = { ...serie, estado: 'Vendido' };
                this.productoSerieService.actualizarProductoSerie(serie.productoSerieId, serieActualizada).subscribe(
                  () => console.log(`✅ Serie ${serie.numeroSerie} marcada como vendida`),
                  (error: any) => console.error(`❌ Error al actualizar serie ${serie.numeroSerie}:`, error)
                );
              });

              // Actualizar stock del producto
              const productoActualizado = {
                ...item.producto,
                stock: item.producto.stock - item.cantidad
              };
              
              console.log(`🔄 Actualizando stock de ${item.producto.nombreProducto}: ${item.producto.stock} -> ${productoActualizado.stock}`);
              
              this.productoService.actualizarProducto(productoActualizado).subscribe(
                () => {
                  console.log('✅ Stock actualizado correctamente');
                  
                  // Registrar movimiento de inventario por cada serie vendida
                  seriesTomadas.forEach((serie: any) => {
                    const movimientoInventario = {
                      producto: { productoId: item.producto.productoId },
                      cantidad: 1, // Una unidad por cada serie
                      tipo: 'Vendido',
                      numeroSerie: serie.numeroSerie,
                      dateCreated: new Date()
                    };
                    
                    this.inventarioService.agregarProductoInventario(movimientoInventario).subscribe(
                      () => console.log(`✅ Movimiento de inventario registrado para serie ${serie.numeroSerie}`),
                      (error) => console.error(`❌ Error al registrar movimiento para serie ${serie.numeroSerie}:`, error)
                    );
                  });
                },
                (error) => console.error('❌ Error al actualizar stock:', error)
              );
            },
            (error) => console.error('❌ Error al guardar detalle de factura:', error)
          );
        },
        (error) => {          console.error(`❌ Error obteniendo series para ${item.producto.nombreProducto}:`, error);
          
          // Fallback: crear detalle sin series específicas
          const detalleFactura = {
            cantidad: item.cantidad,
            precioTotal: item.precioTotal,
            precioUnitario: item.precioUnitario,
            numerosSerie: '',
            tipoServicio: null,
            producto: { productoId: item.producto.productoId },
            factura: { facturaId: factura.facturaId },            createdAt: new Date().toISOString() // Convertir a string para compatibilidad
          };
          
          this.facturaDetailsService.agregarFacturaDetail(detalleFactura).subscribe(
            (response) => {
              console.log('✅ Detalle de factura guardado (sin series específicas):', response);
              
              // Actualizar stock del producto
              const productoActualizado = {
                ...item.producto,
                stock: item.producto.stock - item.cantidad
              };
              
              this.productoService.actualizarProducto(productoActualizado).subscribe(
                () => {
                  console.log('✅ Stock actualizado correctamente');
                  
                  // Registrar movimiento de inventario general
                  const movimientoInventario = {
                    producto: { productoId: item.producto.productoId },
                    cantidad: item.cantidad,
                    tipo: 'Vendido',
                    numeroSerie: '',
                    dateCreated: new Date()
                  };
                  
                  this.inventarioService.agregarProductoInventario(movimientoInventario).subscribe(
                    () => console.log('✅ Movimiento de inventario registrado'),
                    (error) => console.error('❌ Error al registrar movimiento de inventario:', error)
                  );
                },
                (error) => console.error('❌ Error al actualizar stock:', error)
              );
            },
            (error) => console.error('❌ Error al guardar detalle de factura:', error)
          );
        }
      );
    });
    
    // Procesar servicios si los hay
    const detalleServicios = cotizacionDetail.filter((detalle: any) => detalle.tipoServicio !== null).map((detalle: any) => ({
      cantidad: 1,
      precioTotal: detalle.precioTotal,
      precioUnitario: detalle.precioUnitario,
      numerosSerie: '',
      producto: null, // Cambiar de productoId: null a producto: null
      factura: { facturaId: factura.facturaId },
      createdAt: new Date().toISOString(), // Convertir a string para compatibilidad
      tipoServicio: detalle.tipoServicio,
    }));    detalleServicios.forEach((detalle: any) => {
      console.log('💾 Guardando detalle de servicio:', detalle);
      this.facturaDetailsService.agregarFacturaDetail(detalle).subscribe(
        (response) => {
          console.log('✅ Detalle de servicio guardado:', response);
        },
        (error) => {
          console.error('❌ Error al guardar detalle de servicio:', error);
          console.error('📄 Detalle que falló:', detalle);
        }
      );
    });
  }

  crearDetallesFacturaDirecto(cotizacionDetail: any[], factura: any) {
    console.log('🔄 Creando detalles de factura de forma directa');
    console.log('📋 Factura ID:', factura.facturaId);
    
    // Procesar productos
    const productos = cotizacionDetail.filter((detalle: any) => detalle.producto !== null);
    console.log('🛍️ Productos encontrados:', productos.length);
      productos.forEach((detalle: any, index: number) => {
      console.log(`📦 Procesando producto ${index + 1}:`, detalle.producto.nombreProducto);
      
      // Usar el método correcto que maneja cantidadOriginal y cantidadVendida
      this.procesarDetalleProducto(detalle, factura, index).then(() => {
        console.log(`✅ Producto ${index + 1} procesado correctamente en crearDetallesFacturaDirecto`);
      }).catch((error) => {
        console.error(`❌ Error procesando producto ${index + 1} en crearDetallesFacturaDirecto:`, error);
      });
    });
    
    // Procesar servicios
    const servicios = cotizacionDetail.filter((detalle: any) => detalle.tipoServicio !== null);
    console.log('🔧 Servicios encontrados:', servicios.length);
    
    servicios.forEach((detalle: any, index: number) => {
      console.log(`🔧 Procesando servicio ${index + 1}:`, detalle.tipoServicio);
      
      const detalleFactura = {
        cantidad: 1,
        precioTotal: detalle.precioTotal,
        precioUnitario: detalle.precioUnitario,
        numerosSerie: '',
        producto: null,
        factura: { facturaId: factura.facturaId },
        createdAt: new Date().toISOString(),
        tipoServicio: detalle.tipoServicio,
      };
      
      console.log(`💾 Guardando detalle de servicio ${index + 1}:`, detalleFactura);
      
      this.facturaDetailsService.agregarFacturaDetail(detalleFactura).subscribe(
        (response) => {
          console.log(`✅ Detalle de servicio ${index + 1} guardado:`, response);
        },
        (error) => {
          console.error(`❌ Error al guardar detalle de servicio ${index + 1}:`, error);
          console.error('📄 Payload que falló:', detalleFactura);
        }
      );
    });
  }  actualizarStockProducto(producto: any, cantidadVendida: number) {
    console.log('🔄 INICIANDO actualización de stock');
    console.log('📦 Producto recibido:', producto);
    console.log('🔢 Cantidad vendida:', cantidadVendida);
    console.log(`🔄 Stock actual: ${producto.stock} -> Stock nuevo: ${producto.stock - cantidadVendida}`);
    
    if (!producto || !producto.productoId) {
      console.error('❌ Producto inválido para actualizar stock:', producto);
      return;
    }
    
    if (cantidadVendida <= 0) {
      console.error('❌ Cantidad vendida inválida:', cantidadVendida);
      return;
    }
    
    // Usar el endpoint específico para restar stock
    console.log(`� Llamando a restarStock para producto ${producto.productoId} con cantidad ${cantidadVendida}`);
      this.productoService.restarStock(producto.productoId, cantidadVendida).subscribe(
      (response: any) => {
        console.log(`✅ Stock de ${producto.nombreProducto} actualizado correctamente:`, response);
        console.log(`📊 Nuevo stock: ${response.stock}`);
        
        // Registrar movimiento de inventario
        this.registrarMovimientoInventario(producto, cantidadVendida);
      },
      (error: any) => {
        console.error(`❌ Error al restar stock de ${producto.nombreProducto}:`, error);
        console.error('📄 ProductoId:', producto.productoId);
        console.error('📄 Cantidad:', cantidadVendida);
        if (error.error) {
          console.error('🔍 Detalles del error del servidor:', error.error);
        }
      }
    );
  }
  registrarMovimientoInventario(producto: any, cantidadVendida: number) {
    console.log('📋 INICIANDO registro de movimiento de inventario');
    
    const movimientoInventario = {
      producto: { productoId: producto.productoId },
      cantidad: cantidadVendida,
      tipo: 'Vendido',
      numeroSerie: '',
      dateCreated: new Date() // Como Date, no como string
    };
    
    console.log('💾 Movimiento de inventario a registrar:', movimientoInventario);
      this.inventarioService.agregarProductoInventario(movimientoInventario).subscribe(
      (response: any) => {
        console.log(`✅ Movimiento de inventario registrado para ${producto.nombreProducto}:`, response);
      },
      (error: any) => {
        console.error(`❌ Error al registrar movimiento de inventario:`, error);
        console.error('📄 Movimiento que falló:', movimientoInventario);
        if (error.error) {
          console.error('🔍 Detalles del error del servidor:', error.error);
        }
      }    );
  }
  // Método auxiliar para generar números de serie automáticamente
  generarNumerosSerie(nombreProducto: string, cantidad: number): string {
    const timestamp = new Date().getTime();
    const prefix = nombreProducto.substring(0, 3).toUpperCase();
    const numerosSerie: string[] = [];
    
    for (let i = 0; i < cantidad; i++) {
      const numeroSerie = `${prefix}${timestamp}${String(i + 1).padStart(3, '0')}`;
      numerosSerie.push(numeroSerie);
    }
    
    console.log(`🔢 Números de serie generados para ${nombreProducto}:`, numerosSerie);    return numerosSerie.join(', ');
  }

  // Método procesarDetallesFacturaCompleto ya maneja todo correctamente
  // Los métodos obsoletos han sido removidos para evitar confusión
  
  procesarDetallesFacturaCompleto(cotizacionDetail: any[], factura: any): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        console.log('🔄 INICIANDO procesamiento completo de detalles de factura');
        console.log('📋 Factura ID:', factura.facturaId);
        console.log('📊 Total de detalles a procesar:', cotizacionDetail.length);
        
        // Separar productos y servicios
        const productos = cotizacionDetail.filter((detalle: any) => detalle.producto !== null);
        const servicios = cotizacionDetail.filter((detalle: any) => detalle.tipoServicio !== null);
        
        console.log('🛍️ Productos encontrados:', productos.length);
        console.log('🔧 Servicios encontrados:', servicios.length);
        
        // Procesar productos de forma secuencial para evitar conflictos
        for (let i = 0; i < productos.length; i++) {
          const detalle = productos[i];
          console.log(`📦 Procesando producto ${i + 1}/${productos.length}: ${detalle.producto.nombreProducto}`);
          
          try {
            await this.procesarDetalleProducto(detalle, factura, i);
            console.log(`✅ Producto ${i + 1} procesado correctamente`);
          } catch (error) {
            console.error(`❌ Error procesando producto ${i + 1}:`, error);
            // Continuar con el siguiente producto
          }
        }
        
        // Procesar servicios
        for (let i = 0; i < servicios.length; i++) {
          const detalle = servicios[i];
          console.log(`🔧 Procesando servicio ${i + 1}/${servicios.length}: ${detalle.tipoServicio}`);
          
          try {
            await this.procesarDetalleServicio(detalle, factura, i);
            console.log(`✅ Servicio ${i + 1} procesado correctamente`);
          } catch (error) {
            console.error(`❌ Error procesando servicio ${i + 1}:`, error);
            // Continuar con el siguiente servicio
          }
        }
        
        console.log('✅ COMPLETADO procesamiento de todos los detalles de factura');
        resolve();
        
      } catch (error) {
        console.error('❌ Error en procesarDetallesFacturaCompleto:', error);
        reject(error);
      }
    });
  }
  procesarDetalleProducto(detalle: any, factura: any, index: number): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log(`🔍 Obteniendo números de serie para ${detalle.producto.nombreProducto}`);
      
      this.productoSerieService.obtenerSeriesPorProducto(detalle.producto.productoId).subscribe(
        (series: any[]) => {
          console.log(`📋 Series disponibles para ${detalle.producto.nombreProducto}:`, series.length);
          
          // Filtrar solo las series disponibles
          const seriesDisponibles = series.filter((serie: any) => 
            serie.estado === 'Disponible' || serie.estado === 'DISPONIBLE'
          );
          
          console.log(`📊 Series disponibles filtradas:`, seriesDisponibles.length);
          
          // ✨ NUEVA LÓGICA: Ordenar series por prioridad de consumo (FIFO)
          const seriesOrdenadas = this.ordenarSeriesPorPrioridad(seriesDisponibles);
          console.log(`🎯 Series ordenadas por prioridad:`, seriesOrdenadas.map(s => ({
            numeroSerie: s.numeroSerie,
            fechaVencimiento: s.fechaVencimiento,
            cantidad: s.cantidad
          })));
          
          // Seleccionar series usando el algoritmo FIFO
          const seriesTomadas = this.seleccionarSeriesFIFO(seriesOrdenadas, detalle.cantidad);
          
          console.log(`📦 Series seleccionadas:`, seriesTomadas.map(s => ({
            numeroSerie: s.numeroSerie,
            fechaVencimiento: s.fechaVencimiento,
            cantidad: s.cantidad,
            cantidadTomada: s.cantidadTomada
          })));
          
          if (seriesTomadas.length === 0) {
            console.error(`❌ No hay suficientes series disponibles para ${detalle.producto.nombreProducto}`);
          }// Extraer los números de serie
          const numerosSerie = seriesTomadas.map((serie: any) => serie.numeroSerie).join(', ');
          console.log(`🔢 Números de serie asignados: "${numerosSerie}"`);
          console.log(`📝 Longitud de números de serie: ${numerosSerie.length}`);
          console.log(`🔍 Series tomadas:`, seriesTomadas);
          console.log(`🔍 Cada serie:`, seriesTomadas.map(s => ({ id: s.productoSerieId, numero: s.numeroSerie, cantidad: s.cantidad })));
          console.log(`🔍 Array de números de serie:`, seriesTomadas.map((serie: any) => serie.numeroSerie));
          console.log(`🔍 String final de números de serie generado: "${numerosSerie}"`);
          console.log(`🔍 Tipo del string generado: ${typeof numerosSerie}`);
          console.log(`🔍 Es válido el string: ${numerosSerie && numerosSerie.trim() !== ''}`);
          
          // Validar que realmente tengamos números de serie
          if (!numerosSerie || numerosSerie.trim() === '') {
            console.error(`❌ ALERTA: No se generaron números de serie válidos!`);
            console.error(`❌ Series tomadas:`, seriesTomadas);
          }// Crear el detalle de factura
          const detalleFactura = {
            cantidad: detalle.cantidad,
            precioTotal: detalle.precioTotal,
            precioUnitario: detalle.precioUnitario,
            numerosSerie: numerosSerie || '', // Asegurar que no sea null/undefined
            tipoServicio: null,
            producto: { productoId: detalle.producto.productoId },
            factura: { facturaId: factura.facturaId },
            createdAt: new Date().toISOString()
          };
            console.log(`💾 Guardando detalle de producto ${index + 1}:`, JSON.stringify(detalleFactura, null, 2));
          console.log(`🔍 Verificando numerosSerie en payload: "${detalleFactura.numerosSerie}"`);
          console.log(`🔍 Tipo de numerosSerie: ${typeof detalleFactura.numerosSerie}`);
          console.log(`🔍 Longitud de numerosSerie: ${detalleFactura.numerosSerie?.length}`);          console.log(`🔍 Es string vacío: ${detalleFactura.numerosSerie === ''}`);
          console.log(`🔍 Es null o undefined: ${detalleFactura.numerosSerie == null}`);
          
          this.facturaDetailsService.agregarFacturaDetail(detalleFactura).subscribe(async (response: any) => {
              console.log(`✅ Detalle de producto ${index + 1} guardado:`, response);
              console.log(`🔍 Respuesta del backend - numerosSerie: "${response.numerosSerie}"`);
              
              // Verificar si el backend guardó los números de serie
              if (!response.numerosSerie || response.numerosSerie === '') {
                console.warn(`⚠️ ADVERTENCIA: Los números de serie no se guardaron en el backend`);
                console.log(`📤 Enviado: "${detalleFactura.numerosSerie}"`);
                console.log(`📥 Recibido: "${response.numerosSerie}"`);
              }            try {
              // Marcar las series como vendidas (esto incluye el manejo de stock por serie)
              if (seriesTomadas.length > 0) {
                console.log(`🏷️ Procesando ${seriesTomadas.length} series para: ${detalle.producto.nombreProducto}`);
                await this.marcarSeriesComoVendidasConCantidadAsync(seriesTomadas, detalle.producto.productoId);
                console.log(`✅ Series procesadas correctamente - stock reducido por serie`);
              } else {
                // Si no hay series, actualizar stock global
                console.log(`🔄 No hay series - actualizando stock global para: ${detalle.producto.nombreProducto}`);
                await this.actualizarStockProductoAsync(detalle.producto, detalle.cantidad);
                await this.registrarMovimientoInventarioAsync(detalle.producto, detalle.cantidad);
              }
                
                console.log(`✅ Procesamiento completo del producto ${index + 1} terminado`);
                resolve();
                
              } catch (error) {
                console.error(`❌ Error en procesamiento post-guardado del producto ${index + 1}:`, error);
                resolve(); // Continuar aunque haya error
              }
            },
            (error) => {
              console.error(`❌ Error al guardar detalle de producto ${index + 1}:`, error);
              console.error('📄 Payload que falló:', detalleFactura);
              reject(error);
            }
          );
        },
        (error) => {
          console.error(`❌ Error obteniendo series para ${detalle.producto.nombreProducto}:`, error);
          
          // Fallback: crear detalle sin números de serie específicos
          const detalleFactura = {
            cantidad: detalle.cantidad,
            precioTotal: detalle.precioTotal,
            precioUnitario: detalle.precioUnitario,
            numerosSerie: '',
            tipoServicio: null,
            producto: { productoId: detalle.producto.productoId },
            factura: { facturaId: factura.facturaId },
            createdAt: new Date().toISOString()
          };
          
          console.log(`💾 Guardando detalle de producto ${index + 1} (sin series):`, detalleFactura);
          
          this.facturaDetailsService.agregarFacturaDetail(detalleFactura).subscribe(
            async (response) => {
              console.log(`✅ Detalle de producto ${index + 1} guardado (sin series):`, response);
                try {
                console.log(`🔄 Actualizando stock para: ${detalle.producto.nombreProducto}`);
                await this.actualizarStockProductoAsync(detalle.producto, detalle.cantidad);
                console.log(`📋 Registrando movimiento de inventario sin series`);
                await this.registrarMovimientoInventarioAsync(detalle.producto, detalle.cantidad);
                resolve();
              } catch (error) {
                console.error(`❌ Error actualizando stock:`, error);
                resolve(); // Continuar aunque haya error
              }
            },
            (error) => {
              console.error(`❌ Error al guardar detalle de producto ${index + 1}:`, error);
              reject(error);
            }
          );
        }
      );
    });
  }

  procesarDetalleServicio(detalle: any, factura: any, index: number): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log(`🔧 Procesando servicio ${index + 1}: ${detalle.tipoServicio}`);
      
      const detalleFactura = {
        cantidad: 1,
        precioTotal: detalle.precioTotal,
        precioUnitario: detalle.precioUnitario,
        numerosSerie: '',
        producto: null,
        factura: { facturaId: factura.facturaId },
        createdAt: new Date().toISOString(),
        tipoServicio: detalle.tipoServicio,
      };
      
      console.log(`💾 Guardando detalle de servicio ${index + 1}:`, detalleFactura);
      
      this.facturaDetailsService.agregarFacturaDetail(detalleFactura).subscribe(
        (response) => {
          console.log(`✅ Detalle de servicio ${index + 1} guardado:`, response);
          resolve();
        },
        (error) => {
          console.error(`❌ Error al guardar detalle de servicio ${index + 1}:`, error);
          console.error('📄 Payload que falló:', detalleFactura);
          reject(error);
        }
      );
    });
  }  actualizarStockProductoAsync(producto: any, cantidadVendida: number): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('🔄 INICIANDO actualización de stock ASYNC');
      console.log('📦 Producto recibido:', producto);
      console.log('🔢 Cantidad vendida:', cantidadVendida);
      console.log(`🔄 Stock actual: ${producto.stock} -> Stock nuevo: ${producto.stock - cantidadVendida}`);
      
      if (!producto || !producto.productoId) {
        console.error('❌ Producto inválido para actualizar stock:', producto);
        reject(new Error('Producto inválido'));
        return;
      }
      
      if (cantidadVendida <= 0) {
        console.error('❌ Cantidad vendida inválida:', cantidadVendida);
        reject(new Error('Cantidad vendida inválida'));
        return;
      }
      
      // Usar el endpoint específico para restar stock
      console.log(`🔄 Llamando a restarStock para producto ${producto.productoId} con cantidad ${cantidadVendida}`);
      
      this.productoService.restarStock(producto.productoId, cantidadVendida).subscribe(
        (response: any) => {
          console.log(`✅ Stock de ${producto.nombreProducto} actualizado correctamente:`, response);
          console.log(`📊 Nuevo stock: ${response.stock}`);
          
          // NOTA: No registrar movimiento de inventario aquí si se están usando series
          // Los movimientos por serie ya se registran en marcarSeriesComoVendidasAsync
          console.log('ℹ️ Stock actualizado - movimientos de inventario se registran por separado');
          resolve();
        },
        (error: any) => {
          console.error(`❌ Error al restar stock de ${producto.nombreProducto}:`, error);
          console.error('📄 ProductoId:', producto.productoId);
          console.error('📄 Cantidad:', cantidadVendida);
          if (error.error) {
            console.error('🔍 Detalles del error del servidor:', error.error);
          }
          reject(error);
        }
      );
    });
  }

  registrarMovimientoInventarioAsync(producto: any, cantidadVendida: number): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('📋 INICIANDO registro de movimiento de inventario ASYNC');
      
      const movimientoInventario = {
        producto: { productoId: producto.productoId },
        cantidad: cantidadVendida,
        tipo: 'Vendido',
        numeroSerie: '',
        dateCreated: new Date()
      };
      
      console.log('💾 Movimiento de inventario a registrar:', movimientoInventario);
      
      this.inventarioService.agregarProductoInventario(movimientoInventario).subscribe(
        (response: any) => {
          console.log(`✅ Movimiento de inventario registrado para ${producto.nombreProducto}:`, response);
          resolve();
        },
        (error: any) => {
          console.error(`❌ Error al registrar movimiento de inventario:`, error);
          console.error('📄 Movimiento que falló:', movimientoInventario);
          if (error.error) {
            console.error('🔍 Detalles del error del servidor:', error.error);
          }
          reject(error);
        }
      );
    });
  }  marcarSeriesComoVendidasAsync(series: any[], productoId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('🏷️ Marcando series como vendidas ASYNC:', series.length);
      console.log('📦 ProductoID recibido:', productoId);
      
      if (series.length === 0) {
        resolve();
        return;
      }
      
      let stockTotalReducido = 0; // Contador del stock total reducido
      
      const promesasSeries: Promise<void>[] = series.map((serie: any) => {
        return new Promise<void>((resolveSerie, rejectSerie) => {          // Calcular nueva cantidad de la serie
          const nuevaCantidad = serie.cantidad - 1;
          stockTotalReducido += 1; // Incrementar contador          // Inicializar cantidadOriginal si no existe (migración de series existentes)
          let cantidadOriginal = serie.cantidadOriginal;
          if (!cantidadOriginal || cantidadOriginal === 0) {
            // Para series existentes sin cantidadOriginal:
            // Si nunca se ha vendido nada (cantidadVendida es 0 o undefined), cantidadOriginal = cantidad actual + 1 (la que había antes de esta venta)
            // Si ya se ha vendido algo, cantidadOriginal = cantidad actual + cantidad ya vendida + 1
            const yaVendido = serie.cantidadVendida || 0;
            cantidadOriginal = serie.cantidad + yaVendido + 1;
            console.log(`🔧 Calculando cantidadOriginal para serie existente ${serie.numeroSerie}: ${cantidadOriginal} (cantidad actual: ${serie.cantidad}, ya vendida: ${yaVendido}, + 1 por venta actual)`);
          }
          
          // Calcular cantidades para tracking de ventas
          const cantidadVendida = (serie.cantidadVendida || 0) + 1;
            const serieActualizada = {
            ...serie,
            cantidad: nuevaCantidad,
            cantidadOriginal: cantidadOriginal, // Asegurar que se guarde la cantidadOriginal calculada
            cantidadVendida: cantidadVendida,
            // Solo marcar como "Vendido" cuando la cantidad llegue a 0
            estado: nuevaCantidad <= 0 ? 'Vendido' : serie.estado,
            fechaVenta: nuevaCantidad <= 0 ? new Date() : serie.fechaVenta
          };console.log(`🔄 Actualizando serie ${serie.numeroSerie}`);
          console.log(`📊 Cantidad: ${serie.cantidad} -> ${nuevaCantidad}`);
          console.log(`📈 Cantidad original: ${cantidadOriginal}`);
          console.log(`🛒 Cantidad vendida: ${serie.cantidadVendida || 0} -> ${cantidadVendida}`);
          console.log(`🏷️ Estado: ${serie.estado} -> ${serieActualizada.estado}`);
          console.log(`📅 Fecha venta: ${serieActualizada.fechaVenta}`);
          console.log(`📋 Datos completos de serie actualizada:`, serieActualizada);
          
          this.productoSerieService.actualizarProductoSerie(serie.productoSerieId, serieActualizada).subscribe(
            () => {
              console.log(`✅ Serie ${serie.numeroSerie} actualizada correctamente`);
              
              // Registrar movimiento de inventario específico para esta serie
              const movimientoInventario = {
                producto: { productoId: productoId },
                cantidad: 1,
                tipo: 'Vendido',
                numeroSerie: serie.numeroSerie,
                dateCreated: new Date()
              };
              
              console.log('📋 Movimiento de inventario para serie:', movimientoInventario);
              
              this.inventarioService.agregarProductoInventario(movimientoInventario).subscribe(
                () => {
                  console.log(`✅ Movimiento de inventario registrado para serie ${serie.numeroSerie}`);
                  resolveSerie();
                },
                (error) => {
                  console.error(`❌ Error al registrar movimiento para serie ${serie.numeroSerie}:`, error);
                  resolveSerie();
                }
              );
            },
            (error: any) => {
              console.error(`❌ Error al actualizar serie ${serie.numeroSerie}:`, error);
              resolveSerie(); // Continuar aunque falle
            }
          );
        });
      });
      
      Promise.all(promesasSeries)
        .then(async () => {
          console.log('✅ Todas las series procesadas individualmente');
          
          // Ahora actualizar el stock global del producto
          if (stockTotalReducido > 0) {
            try {
              console.log(`🔄 Reduciendo stock global del producto en ${stockTotalReducido} unidades`);
              
              this.productoService.restarStock(productoId, stockTotalReducido).subscribe(
                (response: any) => {
                  console.log(`✅ Stock global actualizado correctamente:`, response);
                  resolve();
                },
                (error: any) => {
                  console.error(`❌ Error al actualizar stock global:`, error);
                  resolve();
                }
              );
            } catch (error) {
              console.error('❌ Error actualizando stock global:', error);
              resolve(); // Continuar aunque haya errores
            }
          } else {
            resolve();
          }
        })
        .catch((error) => {
          console.error('❌ Error procesando series:', error);
          resolve(); // Continuar aunque haya errores
        });
    });
  }

  // ✨ MÉTODO ACTUALIZADO: Marcar series con cantidades específicas
  marcarSeriesComoVendidasConCantidadAsync(series: any[], productoId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('🏷️ Marcando series como vendidas con cantidades específicas:', series.length);
      console.log('📦 ProductoID recibido:', productoId);
      
      if (series.length === 0) {
        resolve();
        return;
      }
      
      let stockTotalReducido = 0;
      
      const promesasSeries: Promise<void>[] = series.map((serie: any) => {
        return new Promise<void>((resolveSerie, rejectSerie) => {
          const cantidadVender = serie.cantidadTomada || 1;
          const nuevaCantidad = serie.cantidad - cantidadVender;
          stockTotalReducido += cantidadVender;
          
          // Inicializar cantidadOriginal si no existe
          let cantidadOriginal = serie.cantidadOriginal;
          if (!cantidadOriginal || cantidadOriginal === 0) {
            const yaVendido = serie.cantidadVendida || 0;
            cantidadOriginal = serie.cantidad + yaVendido + cantidadVender;
            console.log(`🔧 Calculando cantidadOriginal para serie ${serie.numeroSerie}: ${cantidadOriginal}`);
          }
          
          const cantidadVendida = (serie.cantidadVendida || 0) + cantidadVender;
          
          const serieActualizada = {
            ...serie,
            cantidad: nuevaCantidad,
            cantidadOriginal: cantidadOriginal,
            cantidadVendida: cantidadVendida,
            estado: nuevaCantidad <= 0 ? 'Vendido' : serie.estado,
            fechaVenta: nuevaCantidad <= 0 ? new Date() : serie.fechaVenta
          };

          console.log(`🔄 Actualizando serie ${serie.numeroSerie}`);
          console.log(`📊 Cantidad: ${serie.cantidad} -> ${nuevaCantidad} (vendiendo ${cantidadVender})`);
          console.log(`🏷️ Estado: ${serie.estado} -> ${serieActualizada.estado}`);
          
          this.productoSerieService.actualizarProductoSerie(serie.productoSerieId, serieActualizada).subscribe(
            () => {
              console.log(`✅ Serie ${serie.numeroSerie} actualizada correctamente`);
              
              // Registrar movimiento de inventario
              const movimientoInventario = {
                producto: { productoId: productoId },
                cantidad: cantidadVender,
                tipo: 'Vendido',
                numeroSerie: serie.numeroSerie,
                dateCreated: new Date()
              };
              
              this.inventarioService.agregarProductoInventario(movimientoInventario).subscribe(
                () => {
                  console.log(`✅ Movimiento registrado para serie ${serie.numeroSerie} (cantidad: ${cantidadVender})`);
                  resolveSerie();
                },
                (error) => {
                  console.error(`❌ Error registrando movimiento para serie ${serie.numeroSerie}:`, error);
                  resolveSerie();
                }
              );
            },
            (error: any) => {
              console.error(`❌ Error al actualizar serie ${serie.numeroSerie}:`, error);
              resolveSerie();
            }
          );
        });
      });
      
      Promise.all(promesasSeries)
        .then(() => {
          console.log('✅ Todas las series procesadas individualmente');
          
          if (stockTotalReducido > 0) {
            console.log(`🔄 Reduciendo stock global del producto en ${stockTotalReducido} unidades`);
            
            this.productoService.restarStock(productoId, stockTotalReducido).subscribe(
              (response: any) => {
                console.log(`✅ Stock global actualizado correctamente:`, response);
                resolve();
              },
              (error: any) => {
                console.error(`❌ Error al actualizar stock global:`, error);
                resolve();
              }
            );
          } else {
            resolve();
          }
        })
        .catch((error) => {
          console.error('❌ Error procesando series:', error);
          resolve();
        });
    });
  }

  // ✨ NUEVO MÉTODO: Ordenar series por prioridad (FIFO)
  ordenarSeriesPorPrioridad(series: any[]): any[] {
    console.log('🎯 Ordenando series por prioridad FIFO');
    
    return series.sort((a, b) => {
      // 1. Prioridad por fecha de vencimiento (más próximo primero)
      if (a.fechaVencimiento && b.fechaVencimiento) {
        const fechaA = new Date(a.fechaVencimiento);
        const fechaB = new Date(b.fechaVencimiento);
        const diferencia = fechaA.getTime() - fechaB.getTime();
        
        if (diferencia !== 0) {
          console.log(`📅 Ordenando por fecha de vencimiento: ${a.numeroSerie} (${fechaA.toLocaleDateString()}) vs ${b.numeroSerie} (${fechaB.toLocaleDateString()})`);
          return diferencia;
        }
      }
      
      // 2. Si uno tiene fecha de vencimiento y el otro no, priorizar el que tiene fecha
      if (a.fechaVencimiento && !b.fechaVencimiento) {
        console.log(`⏰ Priorizando serie con fecha de vencimiento: ${a.numeroSerie}`);
        return -1;
      }
      if (!a.fechaVencimiento && b.fechaVencimiento) {
        console.log(`⏰ Priorizando serie con fecha de vencimiento: ${b.numeroSerie}`);
        return 1;
      }
      
      // 3. Por fecha de creación (más antiguo primero)
      if (a.fechaCreacion && b.fechaCreacion) {
        const fechaCreacionA = new Date(a.fechaCreacion);
        const fechaCreacionB = new Date(b.fechaCreacion);
        const diferencia = fechaCreacionA.getTime() - fechaCreacionB.getTime();
        
        if (diferencia !== 0) {
          console.log(`📆 Ordenando por fecha de creación: ${a.numeroSerie} vs ${b.numeroSerie}`);
          return diferencia;
        }
      }
      
      // 4. Por número de serie (orden alfabético como último criterio)
      return a.numeroSerie.localeCompare(b.numeroSerie);
    });
  }

  // ✨ NUEVO MÉTODO: Seleccionar series usando FIFO
  seleccionarSeriesFIFO(seriesOrdenadas: any[], cantidadNecesaria: number): any[] {
    console.log(`🎯 Seleccionando series FIFO para cantidad: ${cantidadNecesaria}`);
    
    const seriesSeleccionadas: any[] = [];
    let cantidadRestante = cantidadNecesaria;
    
    for (const serie of seriesOrdenadas) {
      if (cantidadRestante <= 0) break;
      
      const cantidadDisponible = serie.cantidad || 1;
      const cantidadTomar = Math.min(cantidadDisponible, cantidadRestante);
      
      console.log(`📦 Serie ${serie.numeroSerie}: disponible=${cantidadDisponible}, tomar=${cantidadTomar}, restante=${cantidadRestante}`);
      
      // Agregar la serie con la cantidad que vamos a tomar
      seriesSeleccionadas.push({
        ...serie,
        cantidadTomada: cantidadTomar
      });
      
      cantidadRestante -= cantidadTomar;
      
      console.log(`✅ Serie ${serie.numeroSerie} seleccionada, cantidad restante: ${cantidadRestante}`);
    }
    
    if (cantidadRestante > 0) {
      console.warn(`⚠️ No hay suficiente stock. Faltan ${cantidadRestante} unidades`);
    }
    
    console.log(`🎯 Total series seleccionadas: ${seriesSeleccionadas.length}`);
    return seriesSeleccionadas;
  }
}