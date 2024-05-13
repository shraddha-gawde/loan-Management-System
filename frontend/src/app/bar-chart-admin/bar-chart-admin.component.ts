import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { AuthService } from '../auth.service';

Chart.register(...registerables);

@Component({
  selector: 'demo-bar-chart-admin',
  standalone: true,
  imports: [HttpClientModule],
  templateUrl: './bar-chart-admin.component.html',
  styleUrl: './bar-chart-admin.component.css'
})
export class BarChartAdminComponent {
  httpClient = inject(HttpClient);

  readonly baseURL = 'http://localhost:8080/';

  ngOnInit(): void {
    this.RenderBarchart();
  }
  ratesByDate: any;
  constructor(private authService: AuthService) { }
  RenderBarchart() {
    const url = `${this.baseURL}rates`;
    this.httpClient
      .get<any>(url, {
        headers: this.authService.getTokenHeaders(),
      })
      .subscribe((Response) => {
        this.ratesByDate = Response;
        console.log(this.ratesByDate);
        const dates = this.ratesByDate.ratesByDate.map((rate: any) => rate.date);
        const uploadRates = this.ratesByDate.ratesByDate.map((rate: any) => rate.uploadRate);
        const acceptedRates = this.ratesByDate.ratesByDate.map((rate: any) => rate.acceptedRate);
        const rejectedRates = this.ratesByDate.ratesByDate.map((rate: any) => rate.rejectedRate);
        const disbursedRates = this.ratesByDate.ratesByDate.map((rate: any) => rate.disbursedRate);

        // After fetching data, call createChart()
        this.createChart();
      });
  }
  formatDate(dateString: string): string {
    const labelDate = new Date(dateString);
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const formattedCreateDate = `${labelDate.getDate()} ${
      months[labelDate.getMonth()]
    }, ${labelDate.getFullYear()}`;
    return formattedCreateDate;
  }
  createChart() {
    const data = {
      labels: this.ratesByDate.ratesByDate.map((rate: any) => this.formatDate(rate.date)),
      datasets: [
        {
          type: 'bar',
          label: 'Upload Rate',
          data: this.ratesByDate.ratesByDate.map((rate: any) => rate.uploadRate),
          backgroundColor: 'rgba(255, 206, 86, 0.5)',
          borderColor: 'rgba(255, 206, 86, 1)',
          borderWidth: 1,
          barThickness: 15
        },
        {
          type: 'bar',
          label: 'Accepted Rate',
          data: this.ratesByDate.ratesByDate.map((rate: any) => rate.acceptedRate),
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
          barThickness: 15
        },
        {
          type: 'bar',
          label: 'Rejected Rate',
          data: this.ratesByDate.ratesByDate.map((rate: any) => rate.rejectedRate),
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
          barThickness: 15
        },
        {
          type: 'bar',
          label: 'Disbursed Rate',
          data: this.ratesByDate.ratesByDate.map((rate: any) => rate.disbursedRate),
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
          barThickness: 15
        }
      ]
    };
    const myChart = new Chart("barchart", {
      type: 'bar',
      data: data as any,
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }
}
