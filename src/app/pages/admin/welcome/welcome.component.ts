import { CommonModule, NgClass } from '@angular/common';
import { Component} from '@angular/core';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { NgChartsModule } from 'ng2-charts';
import { MatCardModule } from '@angular/material/card';
import { ChartModule } from 'primeng/chart';
import { NONE_TYPE } from '@angular/compiler';
import { MatSelectModule } from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { FacturaService } from 'src/app/services/factura.service';
import { FacturaDetailsService } from 'src/app/services/facturadetails.service';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';
import { forkJoin } from 'rxjs';
import { subMonths, subYears, isWithinInterval } from 'date-fns';
interface Mes {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css'],
  imports: [NgChartsModule,FormsModule,NgClass,CommonModule, MatCardModule,ChartModule,MatSelectModule,MatFormFieldModule ],
  standalone: true
})
export class WelcomeComponent{
   facturas: any[] = [];
  detallesFacturas: any[] = [];
  usuarios: Map<number, any> = new Map();
  facturasFiltradas: any[] = [];

  tabSeleccionado: string = 'mes';
  selectedValue: string = this.getMesActual();
  selectedYear: number = new Date().getFullYear();
  anios: number[] = [];
  calendar: number[][] = [];
  lineaPago: any;

  meses: Mes[] = [
    { value: '01', viewValue: 'Enero' },
    { value: '02', viewValue: 'Febrero' },
    { value: '03', viewValue: 'Marzo' },
    { value: '04', viewValue: 'Abril' },
    { value: '05', viewValue: 'Mayo' },
    { value: '06', viewValue: 'Junio' },
    { value: '07', viewValue: 'Julio' },
    { value: '08', viewValue: 'Agosto' },
    { value: '09', viewValue: 'Septiembre' },
    { value: '10', viewValue: 'Octubre' },
    { value: '11', viewValue: 'Noviembre' },
    { value: '12', viewValue: 'Diciembre' }
  ];

  constructor(
    private facturaService: FacturaService,
    private facturaDetailsService: FacturaDetailsService,
    private userService: UserService
  ) {
    this.generarCalendario();
  }
  ngOnInit(): void {
    // Cargar datos de forma secuencial para asegurar que estén disponibles
    this.cargarDatos();
  }  cargarDatos(): void {
    // Usar forkJoin para cargar ambos datos al mismo tiempo
    forkJoin({
      facturas: this.facturaService.listarFacturas(),
      detalles: this.facturaDetailsService.listarFacturaDetailsParaDashboard() // Usar el nuevo endpoint
    }).subscribe({
      next: (data: any) => {
        this.facturas = data.facturas || [];
        this.detallesFacturas = data.detalles || [];
        this.facturasFiltradas = this.facturas;
        
        console.log('Facturas cargadas:', this.facturas.length);
        console.log('Detalles cargados:', this.detallesFacturas.length);
        
        this.cargarAniosDesdeFechas(this.facturas);
        this.fetchUsuarios();
        this.actualizarGraficoTipoPago();
      },
      error: (error) => {
        console.error('Error al cargar datos:', error);
        Swal.fire('Error', 'Error al cargar los datos del dashboard', 'error');
      }
    });
  }

  fetchUsuarios(): void {
    const userIds = [...new Set(this.facturas.map(f => f.user.id))];
    userIds.forEach(id => {
      if (!this.usuarios.has(id)) {
        this.userService.obtenerUsuario(id).subscribe(
          u => this.usuarios.set(id, u),
          err => console.error(`Error usuario ${id}:`, err)
        );
      }
    });
  }

  // --- 📅 Fechas y calendario ---

  cargarAniosDesdeFechas(data: any[]) {
    const years = new Set<number>();
    data.forEach(f => {
      const fecha = new Date(f.fechaEmision);
      if (!isNaN(fecha.getTime())) years.add(fecha.getFullYear());
    });
    this.anios = Array.from(years).sort((a, b) => b - a);
  }

  generarCalendario() {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

    let week: number[] = [];
    let day = 1;

    for (let i = 0; i < 5; i++) {
      week = [];
      for (let j = 0; j < 7; j++) {
        if (i === 0 && j < firstDay) week.push(0);
        else if (day > lastDay) week.push(0);
        else week.push(day++);
      }
      this.calendar.push(week);
    }
  }

  isCurrentDay(d: number): boolean {
    return d === new Date().getDate();
  }

  getCurrentMonthAndYear(): string {
    const meses = this.meses.map(m => m.viewValue);
    const date = new Date();
    return `${meses[date.getMonth()]} ${date.getFullYear()}`;
  }

  // --- 🧮 Filtros y utilidades ---

  filtrarFacturasPorMesYAnio(): any[] {
    return this.facturas.filter(f => {
      const fecha = new Date(f.fechaEmision);
      const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
      const anio = fecha.getFullYear();
      return mes === this.selectedValue && anio === this.selectedYear;
    });
  }

  getMesActual() {
    return (new Date().getMonth() + 1).toString().padStart(2, '0');
  }

  getMesAnterior() {
    let mes = new Date().getMonth();
    if (mes === 0) mes = 12;
    return mes.toString().padStart(2, '0');
  }

  getMesDeFactura(f: any) {
    return f.fechaEmision.substring(5, 7);
  }

  // --- 📊 Datos para el dashboard ---

  actualizarGraficoTipoPago() {
    const facturasMes = this.filtrarFacturasPorMesYAnio();
    const totalMes = facturasMes.reduce((suma, f) => suma + Number(f.total || 0), 0);

    this.lineaPago = {
      labels: [this.meses.find(m => m.value === this.selectedValue)?.viewValue || 'Mes Seleccionado'],
      datasets: [{
        label: 'Total Facturado',
        data: [totalMes],
        fill: false,
        borderColor: '#42A5F5',
        tension: 0.1
      }]
    };
  }

  getGananciaActual() {
    return this.filtrarFacturasPorMesYAnio().reduce((sum, f) => sum + Number(f.total || 0), 0);
  }

  getGananciaMesAnterior() {
    const anterior = this.getMesAnterior();
    return this.facturas.filter(f => this.getMesDeFactura(f) === anterior && new Date(f.fechaEmision).getFullYear() === this.selectedYear)
      .reduce((sum, f) => sum + Number(f.total || 0), 0);
  }

  getDiferenciaGanancia() {
    return this.getGananciaActual() - this.getGananciaMesAnterior();
  }

  getCantidadFacturasActual() {
    return this.filtrarFacturasPorMesYAnio().length;
  }

  getCantidadFacturasMesAnterior() {
    const anterior = this.getMesAnterior();
    return this.facturas.filter(f => this.getMesDeFactura(f) === anterior && new Date(f.fechaEmision).getFullYear() === this.selectedYear).length;
  }

  getDiferenciaCantidadFacturas() {
    return this.getCantidadFacturasActual() - this.getCantidadFacturasMesAnterior();
  }

  getFacturasMasCaras() {
    return [...this.facturas]
      .sort((a, b) => Number(b.total) - Number(a.total))
      .slice(0, 2);
  }  getProductosVendidos() {
    // Verificar que tenemos datos
    if (!this.detallesFacturas || this.detallesFacturas.length === 0) {
      console.log('No hay detalles de facturas disponibles');
      return [];
    }

    console.log('Detalles facturas:', this.detallesFacturas); // Debug
    
    const productos: { [nombre: string]: number } = {};

    this.detallesFacturas.forEach(detalle => {
      // Con el DTO, el nombre del producto viene directamente
      let nombreProducto = detalle.nombreProducto || '';
      let cantidad = Number(detalle.cantidad) || 0;

      if (nombreProducto && cantidad > 0) {
        productos[nombreProducto] = (productos[nombreProducto] || 0) + cantidad;
      }
    });

    console.log('Productos procesados:', productos); // Debug

    // Convertir a array, ordenar por cantidad descendente y tomar los top 5
    return Object.entries(productos)
      .map(([nombreProducto, cantidad]) => ({
        nombreProducto,
        cantidad
      }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5); // Mostrar solo los top 5
  }

  getTablita() {
    return this.facturas.map(f => ({
      cliente: f.user?.nombre,
      fecha: new Date(f.fechaEmision).toLocaleDateString(),
      codigo: f.codigo,
      estado: f.estado
    }));
  }

  // --- 📈 Opciones de gráfico ---
  barChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false }
    }
  };
 filtrarFacturasPorRango(): any[] {
  const hoy = new Date();
  let fechaInicio: Date;

  switch (this.tabSeleccionado) {
    case 'mes':
      fechaInicio = subMonths(hoy, 1); // hace exactamente 1 mes
      break;
    case '6meses':
      fechaInicio = subMonths(hoy, 6); // hace 6 meses
      break;
    case 'anio':
      fechaInicio = subYears(hoy, 1); // hace 1 año
      break;
    default:
      return this.facturas;
  }

  return this.facturas.filter((f: any) => {
    const fechaEmision = new Date(f.fechaEmision);
    return isWithinInterval(fechaEmision, { start: fechaInicio, end: hoy });
  });
}
getGananciaPorRango(): number {
  return this.filtrarFacturasPorRango()
    .reduce((sum, f) => sum + Number(f.total || 0), 0);
}
getCantidadFacturasPorRango(): number {
  return this.filtrarFacturasPorRango().length;
}

// --- 📦 Servicios ---

  listarFacturas() {
    this.facturaService.listarFacturas().subscribe(
      (facturas: any) => {
        this.facturas = facturas;
        this.facturasFiltradas = facturas;
        this.cargarAniosDesdeFechas(facturas);
        this.fetchUsuarios();
      },
      error => Swal.fire('Error', 'Error al cargar los datos', 'error')
    );
  }

  listarDetallesFacturas() {
    this.facturaDetailsService.listarFacturaDetailsAll().subscribe(
      (detalles: any) => this.detallesFacturas = detalles,
      error => Swal.fire('Error', 'Error al cargar los datos', 'error')
    );
  }

  // Método para verificar si tenemos productos para mostrar
  hayProductosVendidos(): boolean {
    return this.getProductosVendidos().length > 0;
  }

  // Método alternativo para debug
  debugDetallesFacturas(): void {
    console.log('=== DEBUG DETALLES FACTURAS ===');
    console.log('Cantidad de detalles:', this.detallesFacturas.length);
    if (this.detallesFacturas.length > 0) {
      console.log('Primer detalle:', this.detallesFacturas[0]);
      console.log('Estructura del producto:', this.detallesFacturas[0]?.producto);
    }
    console.log('Productos calculados:', this.getProductosVendidos());
  }
}