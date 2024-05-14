import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, inject, numberAttribute } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { AuthService } from '../auth.service';


Chart.register(...registerables);

@Component({
  selector: 'demo-pie-chart-financier',
  standalone: true,
  imports: [HttpClientModule],
  templateUrl: './pie-chart-financier.component.html',
  styleUrl: './pie-chart-financier.component.css'
})
export class PieChartFinancierComponent {
  httpClient = inject(HttpClient);

  readonly baseURL = 'http://localhost:8080/';
  ngOnInit(): void {
    this.RenderPiechart();
  }
  constructor(private authService: AuthService) {}
  // accepted = 0;
  rejected = 0;
  pending = 0;
  disbursed = 0;
  RenderPiechart() {
    const url = `${this.baseURL}statusFinance`;

    this.httpClient
      .get<any>(url, {
        headers: this.authService.getTokenHeaders(),
      })
      .subscribe((Response) => {
        console.log(Response.data);
        // this.accepted =
        //   Response.data.find(
        //     (item: InvoiceStatus) => item.status === 'accepted'
        //   )?.count || 0;
          this.disbursed =
          Response.data.find(
            (item: InvoiceStatus) => item.status === 'disbursed'
          )?.count || 0;
        this.pending =
          Response.data.find(
            (item: InvoiceStatus) => item.status === 'accepted'
          )?.count || 0;
        this.rejected =
          Response.data.find(
            (item: InvoiceStatus) => item.status === 'rejected'
          )?.count || 0;
        this.createChart();
      });
  }

  createChart() {
    const myChart = new Chart('piechart', {
      type: 'doughnut',
      data: {
        labels: ['Rejected', 'Pending' ,'Disbursed'],
        datasets: [
          {
            label: 'Status Analysis',
            data: [this.rejected, this.pending, this.disbursed],
            backgroundColor: ['rgb(255,25,0)', 'rgb(255,165,0)', 'rgb(91,146,0)'],
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