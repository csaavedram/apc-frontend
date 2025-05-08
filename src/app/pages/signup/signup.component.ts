
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from './../../services/user.service';
import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

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
    createdAt: new Date()
  }

  constructor(
    private userService:UserService,
    private snack:MatSnackBar,
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  formSubmit(){
    console.log(this.user);
    if(this.user.username == '' || this.user.username == null){
      this.snack.open('El nombre de usuario es requerido !!','Aceptar',{
        duration : 3000,
      });
      return;
    }

    if(this.user.password == '' || this.user.password == null){
      this.snack.open('La contraseña es requerida !!','Aceptar',{
        duration : 3000,
      });
      return;
    }

    if(this.user.password.length < 8){
      this.snack.open('La contraseña debe tener 8 caracteres como mínimo !!','Aceptar',{
        duration : 3000,
      });
      return;
    }

    if(this.user.nombre == '' || this.user.nombre == null){
      this.snack.open('El nombre es requerido !!','Aceptar',{
        duration : 3000,
      });
      return;
    }

    if(this.user.apellido == '' || this.user.apellido == null){
      this.snack.open('El apellido es requerido !!','Aceptar',{
        duration : 3000,
      });
      return;
    }

    if (this.user.email == '' || this.user.email == null) {
      this.snack.open('El email es requerido !!', 'Aceptar', {
        duration: 3000,
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.user.email)) {
      this.snack.open('El email ingresado no es válido !!', 'Aceptar', {
        duration: 3000,
      });
      return;
    }


    if(this.user.telefono == '' || this.user.telefono == null){
      this.snack.open('El telefono es requerido !!','Aceptar',{
        duration : 3000,
      });
      return;
    }

    this.userService.añadirUsuario(this.user).subscribe(
      (data) => {
        console.log(data);
        Swal.fire('Usuario Guardado', 'usuario registrado con exito en el sistema','success')
        .then((e) => {
          this.router.navigate(['/login']);
        });
      },(error) => {
        console.log(error);
        this.snack.open('Ha ocurrido un error en el sistema !!','Aceptar',{
          duration : 3000
        });
      }
    )
  }

}
