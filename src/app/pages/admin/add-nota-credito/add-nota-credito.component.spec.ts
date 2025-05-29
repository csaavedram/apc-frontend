import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNotaCreditoComponent } from './add-nota-credito.component';

describe('AddNotaCreditoComponent', () => {
  let component: AddNotaCreditoComponent;
  let fixture: ComponentFixture<AddNotaCreditoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddNotaCreditoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddNotaCreditoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
