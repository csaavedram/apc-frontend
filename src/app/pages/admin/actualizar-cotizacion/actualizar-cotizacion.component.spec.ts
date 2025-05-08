import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActualizarCotizacionComponent } from './actualizar-cotizacion.component';

describe('ActualizarCotizacionComponent', () => {
  let component: ActualizarCotizacionComponent;
  let fixture: ComponentFixture<ActualizarCotizacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActualizarCotizacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActualizarCotizacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
