import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { AuthService } from '../auth.service';

Chart.register(...registerables);

@Component({
  selector: 'demo-pie-chart-admin',
  standalone: true,
  imports: [HttpClientModule],
  templateUrl: './pie-chart-admin.component.html',
  styleUrl: './pie-chart-admin.component.css',
})
export class PieChartAdminComponent {
  httpClient = inject(HttpClient);

  readonly baseURL = 'http://localhost:8080/';
  ngOnInit(): void {
    this.RenderPiechart();
  }
  constructor(private authService: AuthService) {}
  financier = 0;
  admin = 0;
  buyer = 0;
  seller = 0;
  RenderPiechart() {
    const url = `${this.baseURL}admin/count`;

    this.httpClient
      .get<any>(url, {
        headers: this.authService.getTokenHeaders(),
      })
      .subscribe((responseArray) => {
        responseArray.forEach((response: any) => {
          if (response.rolename.role === 'admin') {
            this.admin = response.count;
            console.log(this.admin);
          }
          if (response.rolename.role === 'buyer') {
            this.buyer = response.count;
            console.log(`thisis buyer${this.buyer}`);
          }
          if (response.rolename.role === 'seller') {
            this.seller = response.count;
            console.log(this.seller);
          }
          if (response.rolename.role === 'financier') {
            this.financier = response.count;
            console.log(this.financier);
          }
        });
        this.createChart();
      });
  }

  createChart() {
    const myChart = new Chart('piechart', {
      type: 'pie',
      data: {
        labels: ['seller', 'buyer', 'financier', 'admin'],
        datasets: [
          {
            label: 'available users',
            data: [this.seller, this.buyer, this.financier, this.admin],
            backgroundColor: [
              'rgba(255, 99, 132)',
              'rgba(255, 159, 64)',
              'rgba(153, 102, 255)',
              'rgba(75, 192, 192)',
            ],
            hoverOffset: 10,
          },
        ],
      },
    });
  }
}
