import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewCotizacionComponent } from './view-cotizacion.component';

describe('ViewCotizacionComponent', () => {
  let component: ViewCotizacionComponent;
  let fixture: ComponentFixture<ViewCotizacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewCotizacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewCotizacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
