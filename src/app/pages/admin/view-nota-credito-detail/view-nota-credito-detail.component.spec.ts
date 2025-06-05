import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewNotaCreditoDetailComponent } from './view-nota-credito-detail.component';

describe('ViewNotaCreditoDetailComponent', () => {
  let component: ViewNotaCreditoDetailComponent;
  let fixture: ComponentFixture<ViewNotaCreditoDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewNotaCreditoDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewNotaCreditoDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
