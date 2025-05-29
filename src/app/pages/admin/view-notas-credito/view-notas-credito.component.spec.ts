import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewNotasCreditoComponent } from './view-notas-credito.component';

describe('ViewNotasCreditoComponent', () => {
  let component: ViewNotasCreditoComponent;
  let fixture: ComponentFixture<ViewNotasCreditoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewNotasCreditoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewNotasCreditoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
