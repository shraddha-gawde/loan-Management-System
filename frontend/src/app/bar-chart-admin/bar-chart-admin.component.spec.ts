import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BarChartAdminComponent } from './bar-chart-admin.component';

describe('BarChartAdminComponent', () => {
  let component: BarChartAdminComponent;
  let fixture: ComponentFixture<BarChartAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BarChartAdminComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BarChartAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
