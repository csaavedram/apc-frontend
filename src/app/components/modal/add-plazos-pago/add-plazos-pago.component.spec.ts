import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPlazosPagoComponent } from './add-plazos-pago.component';

describe('AddPlazosPagoComponent', () => {
  let component: AddPlazosPagoComponent;
  let fixture: ComponentFixture<AddPlazosPagoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddPlazosPagoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddPlazosPagoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
