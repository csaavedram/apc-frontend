import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { NavbarComponent } from './components/navbar/navbar.component';
import { SignupComponent } from './pages/signup/signup.component';
import { LoginComponent } from './pages/login/login.component';

import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import {MatListModule} from '@angular/material/list';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {MatSnackBarModule} from '@angular/material/snack-bar';

import {MatCardModule} from '@angular/material/card';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatIconModule} from '@angular/material/icon';
import { HomeComponent } from './pages/home/home.component';
import { authInterceptorProviders } from './services/auth.interceptor';
import { DashboardComponent } from './pages/admin/dashboard/dashboard.component';
import { UserDashboardComponent } from './pages/user/user-dashboard/user-dashboard.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { SidebarComponent } from './pages/admin/sidebar/sidebar.component';
import { WelcomeComponent } from './pages/admin/welcome/welcome.component';
import { MatDividerModule } from '@angular/material/divider';

import { CommonModule } from '@angular/common';
import  {MatExpansionModule } from "@angular/material/expansion";
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatStepperModule} from '@angular/material/stepper';
import {MatNativeDateModule} from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressBarModule } from '@angular/material/progress-bar';


import { CarruselComponent } from './components/carrusel/carrusel.component';
import { UserSidebarComponent } from './pages/user/user-sidebar/user-sidebar.component';
import { UserWelcomeComponent } from './pages/user/user-welcome/user-welcome.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ViewProductoComponent } from './pages/admin/view-producto/view-producto.component';
import { AddProductoComponent } from './pages/admin/add-producto/add-producto.component';
import { DetalleProductoComponent } from './pages/admin/detalle-producto/detalle-producto.component';
import { ActualizarProductoComponent } from './pages/admin/actualizar-producto/actualizar-producto.component';
import { ListaProductosComponent } from './pages/catalogo/lista-productos/lista-productos.component';
import { ViewCategoriaComponent } from './pages/admin/view-categoria/view-categoria.component';
import { AddCategoriaComponent } from './pages/admin/add-categoria/add-categoria.component';
import { ActualizarCategoriaComponent } from './pages/admin/actualizar-categoria/actualizar-categoria.component';
import { ViewUsuarioComponent } from './pages/admin/view-usuario/view-usuario.component';
import { FooterComponent } from './components/footer/footer.component';
import { DetalleProductoCatalogoComponent } from './pages/catalogo/detalle-producto/detalle-producto.component';
import { CarritoComponent } from './pages/carrito/carrito.component';
import { ViewCatalogoComponent } from './pages/admin/view-catalogo/view-catalogo.component';
import { ViewInventarioComponent } from './pages/admin/view-inventario/view-inventario.component';
import { AddToCatalogoComponent } from './pages/admin/add-to-catalogo/add-to-catalogo.component';
import { EnvioComponent } from './pages/envio/envio.component';
import { UserProfileComponent } from './pages/user/user-profile/user-profile.component';
import { UserHistoryOrderComponent } from './pages/user/user-history-order/user-history-order.component';
import { UserOrderDetailsComponent } from './pages/user/user-order-details/user-order-details.component';
import { UserAddressesComponent } from './pages/user/user-addresses/user-addresses.component';
import { UserAddAddressesComponent } from './pages/user/user-add-addresses/user-add-addresses.component';
import { AddAddressComponent } from './components/modal/add-address/add-address.component';
import { AddStockComponent } from './pages/admin/add-stock/add-stock.component';
import { ProductoItemComponent } from './components/producto-item/producto-item.component';
import { ViewPedidosComponent } from './pages/admin/view-pedidos/view-pedidos.component';
import { ActualizarEstadoPedidoComponent } from './pages/admin/actualizar-estado-pedido/actualizar-estado-pedido.component';
import { ActualizarCatalogoProductoComponent } from './pages/admin/actualizar-catalogo-producto/actualizar-catalogo-producto.component';
import { SolicitudComponent } from './pages/solicitud/solicitud.component';
import { AddPaymentComponent } from './components/modal/add-payment/add-payment.component';
import { UserPayRequestComponent } from './pages/user/user-pay-request/user-pay-request.component';
import { UserRequestComponent } from './pages/user/user-request/user-request.component';
import { UserRequestDetailsComponent } from './pages/user/user-request-details/user-request-details.component';
import { SoloNumerosDirective } from './directives/solo-numeros.directive';
import { ViewProveedorComponent } from './pages/admin/view-proveedor/view-proveedor.component';
import { AddProveedorComponent } from './pages/admin/add-proveedor/add-proveedor.component';
import { ActualizarProveedorComponent } from './pages/admin/actualizar-proveedor/actualizar-proveedor.component';
import { ViewClienteComponent } from './pages/admin/view-cliente/view-cliente.component';
import { AddClienteComponent } from './pages/admin/add-cliente/add-cliente.component';
import { ActualizarClienteComponent } from './pages/admin/actualizar-cliente/actualizar-cliente.component';
import { ViewAlmacenComponent } from './pages/admin/view-almacen/view-almacen.component';
import { AddAlmacenComponent } from './pages/admin/add-almacen/add-almacen.component';
import { ActualizarAlmacenComponent } from './pages/admin/actualizar-almacen/actualizar-almacen.component';
import { ViewServicioComponent } from './pages/admin/view-servicio/view-servicio.component';
import { AddServicioComponent } from './pages/admin/add-servicio/add-servicio.component';
import { ActualizarServicioComponent } from './pages/admin/actualizar-servicio/actualizar-servicio.component';
import { MantenimientoComponent } from './pages/mantenimiento/mantenimiento.component';
import { AtenderPedidoComponent } from './pages/admin/atender-pedido/atender-pedido.component';
import { AddCotizacionComponent } from './pages/admin/add-cotizacion/add-cotizacion.component';
import { ViewFacturaComponent } from './pages/admin/view-facturas/view-facturas.component';

// Importaciones para ngx-toastr
import { ToastrModule } from 'ngx-toastr';




@NgModule({ declarations: [
        SoloNumerosDirective,
        AppComponent,
        NavbarComponent,
        SignupComponent,
        LoginComponent,
        HomeComponent,
        DashboardComponent,
        ProfileComponent,
        SidebarComponent,
        CarruselComponent,
        UserSidebarComponent,
        UserWelcomeComponent,
        ViewProductoComponent,
        AddProductoComponent,
        DetalleProductoComponent,
        ActualizarProductoComponent,
        UserDashboardComponent,
        ViewCategoriaComponent,
        AddCategoriaComponent,
        ActualizarCategoriaComponent,
        ViewUsuarioComponent,
        FooterComponent,
        DetalleProductoCatalogoComponent,
        ListaProductosComponent,
        CarritoComponent,
        ViewCatalogoComponent,
        ViewInventarioComponent,
        AddToCatalogoComponent,
        EnvioComponent,
        UserProfileComponent,
        UserHistoryOrderComponent,
        UserOrderDetailsComponent,
        UserAddressesComponent,
        UserAddAddressesComponent,
        AddAddressComponent,
        AddStockComponent,
        ProductoItemComponent,
        ViewPedidosComponent,
        ActualizarEstadoPedidoComponent,
        ActualizarCatalogoProductoComponent,
        SolicitudComponent,
        AddPaymentComponent,
        UserPayRequestComponent,
        UserRequestComponent,
        UserRequestDetailsComponent,
        ViewProveedorComponent,
        AddProveedorComponent,
        ActualizarProveedorComponent,
        ViewClienteComponent,
        AddClienteComponent,
        ActualizarClienteComponent,
        ViewAlmacenComponent,
        AddAlmacenComponent,
        ActualizarAlmacenComponent,
        ViewServicioComponent,
        AddServicioComponent,
        ActualizarServicioComponent,
        MantenimientoComponent,
        AtenderPedidoComponent,
        ViewFacturaComponent,
     
    ],
    exports: [MatToolbarModule, MatButtonModule, MatIconModule, MatExpansionModule],
    bootstrap: [AppComponent], imports: [BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatCheckboxModule,
        FormsModule,
        MatSnackBarModule,
        MatCardModule,
        MatToolbarModule,
        MatIconModule,
        MatListModule,
        CommonModule,
        MatExpansionModule,
        MatDividerModule,
        MatSlideToggleModule,
        MatSelectModule,
        MatDatepickerModule,        MatNativeDateModule,        MatStepperModule,
        ReactiveFormsModule,
        MatProgressSpinnerModule,
        MatDialogModule,
        MatTabsModule,
        MatProgressBarModule,ToastrModule.forRoot({
          timeOut: 3000,
          positionClass: 'toast-bottom-right',
          preventDuplicates: true,
          progressBar: true,
          closeButton: true,
          enableHtml: true,
          toastClass: 'ngx-toastr custom-toast'
        }),
        ],providers: [authInterceptorProviders, MatDialog, provideHttpClient(withInterceptorsFromDi())]})
export class AppModule { }
