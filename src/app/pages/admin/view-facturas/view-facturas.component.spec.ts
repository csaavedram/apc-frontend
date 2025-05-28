import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewFacturaComponent } from './view-facturas.component';

describe('ViewFacturaComponent', () => {
  let component: ViewFacturaComponent;
  let fixture: ComponentFixture<ViewFacturaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewFacturaComponent]
    });
    fixture = TestBed.createComponent(ViewFacturaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
