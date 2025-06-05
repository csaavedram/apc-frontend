import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(private toastr: ToastrService) { }  success(message: string, title?: string) {
    this.toastr.success(message, title, {
      timeOut: 3000,
      progressBar: true,
      closeButton: true,
      enableHtml: true
    });
  }
  error(message: string, title?: string) {
    this.toastr.error(message, title, {
      timeOut: 4000,
      progressBar: true,
      closeButton: true,
      enableHtml: true
    });
  }
  warning(message: string, title?: string) {
    this.toastr.warning(message, title, {
      timeOut: 3500,
      progressBar: true,
      closeButton: true,
      enableHtml: true
    });
  }
  info(message: string, title?: string) {
    this.toastr.info(message, title, {
      timeOut: 3000,
      progressBar: true,
      closeButton: true,
      enableHtml: true
    });
  }

  // Métodos específicos para validaciones de formulario
  validationError(message: string) {
    this.error(message, 'Error de validación');
  }

  requiredField(fieldName: string) {
    this.warning(`El campo ${fieldName} es requerido`, 'Campo requerido');
  }

  invalidFormat(fieldName: string, format: string) {
    this.error(`El ${fieldName} debe tener el formato: ${format}`, 'Formato inválido');
  }
}
