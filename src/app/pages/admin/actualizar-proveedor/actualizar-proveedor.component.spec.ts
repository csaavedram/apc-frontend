import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActualizarProveedorComponent } from './actualizar-proveedor.component';

describe('ActualizarProveedorComponent', () => {
  let component: ActualizarProveedorComponent;
  let fixture: ComponentFixture<ActualizarProveedorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ActualizarProveedorComponent]
    });
    fixture = TestBed.createComponent(ActualizarProveedorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});