import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, inject, numberAttribute } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { AuthService } from '../auth.service';
Chart.register(...registerables);

@Component({
  selector: 'demo-pie-chart-seller',
  standalone: true,
  imports: [HttpClientModule],
  templateUrl: './pie-chart-seller.component.html',
  styleUrl: './pie-chart-seller.component.css'
})
export class PieChartSellerComponent {

  httpClient = inject(HttpClient);

  readonly baseURL = 'http://localhost:8080/';
  ngOnInit(): void {
    this.RenderPiechart();
  }

  constructor(private authService: AuthService) {}
  accepted = 0;
  rejected = 0;
  pending = 0;
  disbursed = 0;
  information:any


  

  RenderPiechart() {
    const url = `${this.baseURL}statusCount`;
    this.httpClient
    .get<any>(`${this.baseURL}seller`, {
      headers: this.authService.getTokenHeaders(),
    })
    .subscribe((Response) => {
      this.information = Response.data;
      console.log(this.information);
      this.createChart();
    });
  }

  createChart() {
    const myChart = new Chart('piechart', {
      type: 'doughnut',
      data: {
        labels: ['Accepted', 'Rejected' ,'Disbursed'],
        datasets: [
          {
            label: 'Status Analysis',
            data: [this.information.acceptedCount || 0, this.information.rejectedCount || 0, this.information.disbursedCount || 0],
            backgroundColor: ['#75dba9', 'rgb(255,25,0)','rgb(91,146,0)'],
            hoverOffset: 10 ,
          },
        ],
      },
    });
  }
}

interface InvoiceStatus {
  status: string;
  count: number;
}
