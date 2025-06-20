import { UserService } from './../../services/user.service';
import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  public user = {
    username : '',
    password : '',
    nombre : '',
    apellido : '',
    email : '',
    telefono : '',
    tipoUsuario: 'persona_natural',
    aceptaTerminos: false,
    createdAt: new Date()
  }

  public usernameStatus: 'checking' | 'available' | 'taken' | '' = '';
  private checkUsernameTimeout: any;

  constructor(
    private userService:UserService,
    private toastService: ToastService,
    private router: Router
  ) { }
  ngOnInit(): void {
  }
  verificarUsernameDisponible(): void {
    // Limpiar timeout previo si existe
    if (this.checkUsernameTimeout) {
      clearTimeout(this.checkUsernameTimeout);
    }

    // Resetear estado si el campo está vacío
    if (!this.user.username || this.user.username.trim() === '') {
      this.usernameStatus = '';
      return;
    }

    // Validar formato antes de verificar disponibilidad
    const isValidFormat = this.validarFormatoUsername();
    if (!isValidFormat) {
      this.usernameStatus = '';
      return;
    }    // Debounce la verificación
    this.usernameStatus = 'checking';
    this.checkUsernameTimeout = setTimeout(() => {
      this.userService.verificarDisponibilidadUsername(this.user.username).subscribe(
        (response: any) => {
          // El endpoint debería devolver { disponible: true/false }
          if (response && response.disponible === false) {
            this.usernameStatus = 'taken';
          } else {
            this.usernameStatus = 'available';
          }
        },
        (error: any) => {
          console.log('Error al verificar username:', error);
          // Si es error 404 o similar, podríamos considerar que está disponible
          if (error.status === 404) {
            this.usernameStatus = 'available';
          } else {
            this.usernameStatus = '';
            console.error('Error al verificar username:', error);
          }
        }
      );
    }, 500); // Esperar 500ms después de que el usuario deje de escribir
  }

  private validarFormatoUsername(): boolean {
    if (this.user.tipoUsuario === 'persona_natural') {
      const dniRegex = /^\d{8}$/;
      return dniRegex.test(this.user.username);
    } else if (this.user.tipoUsuario === 'empresa') {
      const rucRegex = /^\d{11}$/;
      return rucRegex.test(this.user.username);
    }
    return false;
  }

  onUsernameInput(): void {
    // Resetear el estado cuando el usuario esté escribiendo
    if (this.usernameStatus !== 'checking') {
      this.usernameStatus = '';
    }
  }

  onTipoUsuarioChange(): void {
    // Resetear el estado del username cuando cambie el tipo de usuario
    this.usernameStatus = '';
    // Si hay un username ingresado, verificarlo con el nuevo tipo
    if (this.user.username && this.user.username.trim() !== '') {
      setTimeout(() => {
        this.verificarUsernameDisponible();
      }, 100);
    }
  }

  formSubmit(){
    console.log(this.user);    if(this.user.username == '' || this.user.username == null){
      const tipoDocumento = this.user.tipoUsuario === 'empresa' ? 'RUC' : 'DNI';
      this.toastService.requiredField(tipoDocumento);
      return;
    }    // Validación específica para DNI (8 dígitos para personas naturales)
    if (this.user.tipoUsuario === 'persona_natural') {
      const dniRegex = /^\d{8}$/;
      if (!dniRegex.test(this.user.username)) {
        this.toastService.invalidFormat('DNI', '8 dígitos');
        return;
      }
    }

    // Validación para empresas (RUC como username - 11 dígitos)
    if (this.user.tipoUsuario === 'empresa') {
      const rucRegex = /^\d{11}$/;
      if (!rucRegex.test(this.user.username)) {
        this.toastService.invalidFormat('RUC', '11 dígitos');
        return;
      }
    }    if(this.user.password == '' || this.user.password == null){
      this.toastService.requiredField('contraseña');
      return;
    }

    if(this.user.password.length < 8){
      this.toastService.validationError('La contraseña debe tener 8 caracteres como mínimo');
      return;
    }if(this.user.nombre == '' || this.user.nombre == null){
      const tipoNombre = this.user.tipoUsuario === 'empresa' ? 'Razón Social' : 'nombre';
      this.toastService.requiredField(tipoNombre);
      return;
    }

    // Validación de nombre/razón social según tipo de usuario
    if (this.user.tipoUsuario === 'empresa') {
      // Para empresas: letras, números, espacios y puntos
      const razonSocialRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\.]+$/;
      if (!razonSocialRegex.test(this.user.nombre)) {
        this.toastService.validationError('La Razón Social solo debe contener letras, números, espacios y puntos');
        return;
      }
    } else {
      // Para personas naturales: solo letras y espacios
      const nombreRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
      if (!nombreRegex.test(this.user.nombre)) {
        this.toastService.validationError('El nombre solo debe contener letras');
        return;
      }
    }    // Validación de apellido solo para personas naturales
    if (this.user.tipoUsuario !== 'empresa') {
      if(this.user.apellido == '' || this.user.apellido == null){
        this.toastService.requiredField('apellido');
        return;
      }

      // Validación de apellido: solo letras y espacios
      const apellidoRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
      if (!apellidoRegex.test(this.user.apellido)) {
        this.toastService.validationError('El apellido solo debe contener letras');
        return;
      }
    }    if (this.user.email == '' || this.user.email == null) {
      this.toastService.requiredField('email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.user.email)) {
      this.toastService.validationError('El formato del email no es válido');
      return;
    }    if(this.user.telefono == '' || this.user.telefono == null){
      this.toastService.requiredField('teléfono');
      return;
    }

    // Validación de teléfono peruano (9 dígitos que empiecen con 9)
    const telefonoRegex = /^9\d{8}$/;
    if (!telefonoRegex.test(this.user.telefono)) {
      this.toastService.validationError('El teléfono debe tener 9 dígitos y empezar con 9');
      return;
    }    // Validación de términos y condiciones
    if (!this.user.aceptaTerminos) {
      this.toastService.warning('Debe aceptar los términos y condiciones para registrarse', 'Términos requeridos');
      return;
    }

    // Verificar que el username esté disponible antes de proceder
    if (this.usernameStatus === 'taken') {
      const tipoDocumento = this.user.tipoUsuario === 'empresa' ? 'RUC' : 'DNI';
      this.toastService.validationError(`Este ${tipoDocumento} ya está registrado en el sistema`);
      return;
    }

    // Si no se ha verificado el username o está en proceso, verificarlo ahora
    if (this.usernameStatus !== 'available') {
      this.toastService.warning('Por favor, espere mientras verificamos la disponibilidad del ' + 
        (this.user.tipoUsuario === 'empresa' ? 'RUC' : 'DNI'));
      this.verificarUsernameDisponible();
      return;
    }

    this.userService.añadirUsuario(this.user).subscribe(
      (data) => {
        console.log(data);        Swal.fire({
          title: 'Usuario Guardado',
          text: 'Usuario registrado con éxito en el sistema',
          icon: 'success',
          confirmButtonColor: '#00CED1',
          confirmButtonText: 'Aceptar',
          background: '#ffffff',
          color: '#333333'
        })
        .then((e) => {
          this.router.navigate(['/login']);
        });
      },(error) => {
        console.log(error);
        this.toastService.error('Ha ocurrido un error en el sistema. Por favor, inténtelo de nuevo', 'Error del sistema');
      }
    )
  }

}
