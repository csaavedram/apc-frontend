import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewTipoPagoComponent } from './view-tipo-pago.component';

describe('ViewTipoPagoComponent', () => {
  let component: ViewTipoPagoComponent;
  let fixture: ComponentFixture<ViewTipoPagoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewTipoPagoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewTipoPagoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
