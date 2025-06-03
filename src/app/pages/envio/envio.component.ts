import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AbstractControl, FormBuilder, ValidatorFn, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AddressesService } from 'src/app/services/addresses.service';
import { LoginService } from 'src/app/services/login.service';
import { OrdersService } from 'src/app/services/orders.service';
import { OrdersDetailsService } from 'src/app/services/ordersdetails.service';
import { ProductoService } from 'src/app/services/producto.service';
import Swal from 'sweetalert2';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { AddAddressComponent } from 'src/app/components/modal/add-address/add-address.component';
import { InventarioService } from 'src/app/services/inventario.service';

@Component({
  selector: 'app-envio',
  templateUrl: './envio.component.html',
  styleUrls: ['./envio.component.css'],
})
export class EnvioComponent implements OnInit {

  myList: any[] = this.loadFromLocalStorage();
  user: any;

  // Datos Personales

  tipoDocumento = [
    {
      id: 1,
      name: 'DNI',
    },
    {
      id: 2,
      name: 'RUC',
    },
  ];

  metodoPago: any

  personalData = {
    tipoDocumento: null,
    numeroDocumento: '',
  };

  // Entrega

  provinciasFiltradas: any[] = [];
  distritosFiltrados: any[] = [];
  direccionesFiltradas: any[] = [];
  districtType: any

  // Guardar Orden en la BD

  producto = {
    productoId: '',
  };

  orderId: any;

  orderData = {
    createdAt: '',
    deliveryPrice: 0,
    status: '',
    streetAddress: '',
    subtotalPrice: 0,
    totalPrice: '',
    user: {
      id: '',
    },
    documento: '',
    fechaOperacion: '',
    noperacion: '',
    tipoOperacion: ''
  };

  orderDetailsData = {
    createdAt: '',
    quantity: 0,
    totalPrice: 0,
    unitPrice: 0,
    updatedAt: '',
    order: {
      orderId: '',
    },
    product: {
      productoId: '',
    },
  };

  // 1er Formulario

  firstFormGroup = this._formBuilder.group({
    address: ['', Validators.required],
  });

  onSubmitForm_1() {
    if (!this.firstFormGroup.valid) {
      this.snack.open('Debe seleccionar una dirección', '', {
        duration: 3000,
      });
      return;
    }
  }

  // 2do Formulario

  secondFormGroup = this._formBuilder.group({
    tipoDocumento: [null, Validators.required],
    nroDocumento: [
      { value: '', disabled: true },
      [Validators.required, this.documentValidator()],
    ],
  });

  isDocumentoEnabled = false;

  onTipoDocumentoChange() {
    const tipoDocumentoControl = this.secondFormGroup.get('tipoDocumento');
    const nroDocumentoControl = this.secondFormGroup.get('nroDocumento');

    if (tipoDocumentoControl && nroDocumentoControl) {
      // Verificación de nulidad
      const tipoDocumento = tipoDocumentoControl.value;

      if (tipoDocumento === 1 || tipoDocumento === 2) {
        nroDocumentoControl.enable();
      } else {
        nroDocumentoControl.disable();
        nroDocumentoControl.reset();
      }
    }
  }

  documentValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;
      const tipoDocumento = this.secondFormGroup?.get('tipoDocumento')?.value;

      if (!tipoDocumento) {
        return null;
      }

      if (tipoDocumento === 1 && value.length !== 8) {
        return { invalidDNI: true };
      }

      if (tipoDocumento === 2) {
        if (value.length !== 11) {
          return { invalidRUC: true };
        }
        const stockRegex = /^(10|20)\d{9}$/;
        if (!stockRegex.test(value)) {
          return { invalidRUCFormat: true };
        }
      }

      return null;
    };
  }

  validFirstStep: boolean = false;

  onSubmitForm_2() {
    if (!this.secondFormGroup.valid) {
      this.snack.open('Debe Seleccionar el Tipo de Documento', '', {
        duration: 3000,
      });

      const errors = this.secondFormGroup.get('nroDocumento')?.errors;
      if (errors) {
        if (errors['invalidDNI']) {
          this.snack.open('El número del documento (DNI) debe tener 8 dígitos', '', {
            duration: 3000,
          });
          return;
        } else if (errors['invalidRUC']) {
          this.snack.open('El número del documento (RUC) debe tener 11 dígitos', '', {
            duration: 3000,
          });
          return;
        } else if (errors['invalidRUCFormat']) {
          this.snack.open('El número del documento (RUC) debe iniciar con 10 o 20', '', {
            duration: 3000,
          });
          return;
        }
      }

      return;
    }

    // Aquí termina el proceso de cotización
    this.guardarInformacion();
  }

  constructor(
    private snack: MatSnackBar,
    private _formBuilder: FormBuilder,
    public dialog: MatDialog,
    private addressesService: AddressesService,
    private loginService: LoginService,
    private orderService: OrdersService,
    private orderDetailsService: OrdersDetailsService,
    private productoService: ProductoService,
    private http: HttpClient,
    private inventarioService: InventarioService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.user = this.loginService.getUser();
    this.orderData.user.id = this.user.id;

    this.orderData.fechaOperacion = this.getCurrentDate();
    this.orderData.createdAt = this.getCurrentDate();
    this.orderData.status = 'Solicitado';
    this.orderData.subtotalPrice = this.subtotal();
    this.orderData.totalPrice = this.totalCart();

    if (this.orderData.user.id) {
      this.addressesService.listarAddressesByUser(this.user.id).subscribe(
        (data: any) => {
          this.direccionesFiltradas = data;
        },
        (error) => {
          console.log(error);
          Swal.fire('Error !!', 'Error al cargar los datos', 'error');
        }
      );
    }
  }

  guardarInformacion() {
    this.orderData.totalPrice = this.totalCart();

    this.orderService.agregarOrder(this.orderData).subscribe(
      (data: any) => {
        console.log(data);
        Swal.fire('Cotización guardada', 'Se ha agregado su cotización', 'success');
        const orderIdData = data.orderId;

        this.myList.forEach((element) => {
          this.orderDetailsData.createdAt = this.getCurrentDate();
          this.orderDetailsData.quantity = element.cantidad;
          this.orderDetailsData.unitPrice = element.precio;
          this.orderDetailsData.totalPrice = element.cantidad * element.precio;
          this.orderDetailsData.order = { orderId: orderIdData };
          this.orderDetailsData.product.productoId = element.productoId;
          this.producto.productoId = this.orderDetailsData.product.productoId;

          this.orderDetailsService.agregarOrdersDetail(this.orderDetailsData).subscribe(
            (data: any) => {
              const storedList = localStorage.getItem('myList');
              if (storedList) {
                let myList = JSON.parse(storedList);
                myList = [];
                localStorage.setItem('myList', JSON.stringify(myList));
              } else {
                console.log('No se encontró ningún objeto con la clave "myList" en el local storage.');
              }
            },
            (error) => {
              console.log(error);
              Swal.fire('Error !!', 'Error al cargar los datos', 'error');
            }
          );

          const movimiento = {
            cantidad: this.orderDetailsData.quantity,
            tipo: 'Reservado',
            dateCreated: this.getCurrentDate(),
            producto: {
              productoId: this.orderDetailsData.product.productoId
            },
          };

          console.log('Movimiento:', movimiento);

          this.inventarioService.agregarProductoInventario(movimiento).subscribe(
            (dataMovimiento) => {},
            (errorMovimiento) => {
              Swal.fire('Error en el sistema', 'No se ha podido registrar el movimiento', 'error');
              console.log(errorMovimiento);
            }
          );

          element.stock = element.stock - this.orderDetailsData.quantity;

          this.productoService.actualizarProducto(element).subscribe(
            (data: any) => {},
            (error) => {
              Swal.fire('Error !!', 'Error al cargar los datos', 'error');
            }
          );
        });
        Swal.fire('Cotización guardada', 'Se ha agregado su cotización', 'success').then((e) => {
          this.router.navigate(['/user/historial-de-pedidos']);
        });
      },
      (error) => {
        console.log(error);
        Swal.fire('Error !!', 'Error al cargar los datos', 'error');
      }
    );
  }

  getCurrentDate(): string {
    const currentDate = new Date();
    return currentDate.toISOString();
  }

  openAddressDialog() {
    const dialogRef = this.dialog.open(AddAddressComponent, {
      width: '50%',
      height: '82%'
    });

    dialogRef.afterClosed().subscribe(data => {
      this.addressesService.listarAddressesByUser(this.user.id).subscribe(
        (data: any) => {
          this.direccionesFiltradas = data;
        },
        (error) => {
          Swal.fire('Error !!', 'Error al cargar los datos', 'error');
        }
      )
    });
  }

  loadFromLocalStorage() {
    const storedList = localStorage.getItem('myList');
    return storedList ? JSON.parse(storedList) : [];
  }

  cantidadProductos(): any {
    return this.myList.reduce(function (acc, product) {
      return acc + product.cantidad;
    }, 0);
  }

  subtotal() {
    const subtotal = this.totalCart() * (1 - 0.18);
    return Number(subtotal.toFixed(2));
  }

  igv() {
    const igv = this.totalCart() * 0.18;
    return Number(igv.toFixed(2));
  }

  totalCart() {
    const total = this.myList.reduce(function (acc, product) { return acc + (product.cantidad * product.precio); }, 0);
    return total;
  }

  onAddressChange(direccion: any) {
    this.orderData.streetAddress = `${direccion.name}, ${direccion.district.name}, ${direccion.province.name}, ${direccion.department.name}`;
    this.districtType = direccion.district.type;
    if (this.districtType === 'A') {
      this.orderData.deliveryPrice = 0;
    }
    if (this.districtType === 'B') {
      this.orderData.deliveryPrice = 10;
    }
    if (this.districtType === 'C') {
      this.orderData.deliveryPrice = 15;
    }
    if (this.districtType === 'D') {
      this.orderData.deliveryPrice = 30;
    }
  }
}
