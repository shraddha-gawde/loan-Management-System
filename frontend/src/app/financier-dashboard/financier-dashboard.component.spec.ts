import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinancierDashboardComponent } from './financier-dashboard.component';

describe('FinancierDashboardComponent', () => {
  let component: FinancierDashboardComponent;
  let fixture: ComponentFixture<FinancierDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinancierDashboardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FinancierDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
