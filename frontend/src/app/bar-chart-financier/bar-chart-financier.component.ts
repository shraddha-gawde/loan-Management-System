import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { AuthService } from '../auth.service';

Chart.register(...registerables);

@Component({
  selector: 'demo-bar-chart-financier',
  standalone: true,
  imports: [HttpClientModule],
  templateUrl: './bar-chart-financier.component.html',
  styleUrl: './bar-chart-financier.component.css',
})
export class BarChartFinancierComponent {
  httpClient = inject(HttpClient);

  readonly baseURL = 'http://localhost:8080/';

  ngOnInit(): void {
    this.RenderBarchart();
  }

  constructor(private authService: AuthService) {}

  acceptCount1 = 0;
  acceptCount2 = 0;
  acceptCount3 = 0;
  acceptCount4 = 0;
  acceptCount5 = 0;

  rejectCount1 = 0;
  rejectCount2 = 0;
  rejectCount3 = 0;
  rejectCount4 = 0;
  rejectCount5 = 0;

  count1Label = '';
  count2Label = '';
  count3Label = '';
  count4Label = '';
  count5Label = '';

  RenderBarchart() {
    const url = `${this.baseURL}dateCountFinince`;
    this.httpClient
      .get<any>(url, {
        headers: this.authService.getTokenHeaders(),
      })
      .subscribe((Response) => {
        console.log(Response.data);
        Response.data.forEach((item: ResponseItem, index: number) => {
          switch (index) {
            case 0:
              this.count1Label = this.formatDate(item.date);
              this.acceptCount1 = item.disbursed_count;
              this.rejectCount1 = item.rejected_count;
              break;
            case 1:
              this.count2Label = this.formatDate(item.date);
              this.acceptCount2 = item.disbursed_count;
              this.rejectCount2 = item.rejected_count;
              break;
            case 2:
              this.count3Label = this.formatDate(item.date);
              this.acceptCount3 = item.disbursed_count;
              this.rejectCount3 = item.rejected_count;
              break;
            case 3:
              this.count4Label = this.formatDate(item.date);
              this.acceptCount4 = item.disbursed_count;
              this.rejectCount4 = item.rejected_count;
              break;
            case 4:
              this.count5Label = this.formatDate(item.date);
              this.acceptCount5 = item.disbursed_count;
              this.rejectCount5 = item.rejected_count;
              break;
            default:
              break;
          }
        });

        this.count1Label = this.count1Label || '';
        this.count2Label = this.count2Label || '';
        this.count3Label = this.count3Label || '';
        this.count4Label = this.count4Label || '';
        this.count5Label = this.count5Label || '';
        this.acceptCount1 = this.acceptCount1 || 0;
        this.acceptCount2 = this.acceptCount2 || 0;
        this.acceptCount3 = this.acceptCount3 || 0;
        this.acceptCount4 = this.acceptCount4 || 0;
        this.acceptCount5 = this.acceptCount5 || 0;
        this.rejectCount1 = this.rejectCount1 || 0;
        this.rejectCount2 = this.rejectCount2 || 0;
        this.rejectCount3 = this.rejectCount3 || 0;
        this.rejectCount4 = this.rejectCount4 || 0;
        this.rejectCount5 = this.rejectCount5 || 0;
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
      labels: [
        this.count1Label,
        this.count2Label,
        this.count3Label,
        this.count4Label,
        this.count5Label,
      ],
      datasets: [
        {
          type: 'bar',
          label: 'Accepted',
          data: [
            this.acceptCount1,
            this.acceptCount2,
            this.acceptCount3,
            this.acceptCount4,
            this.acceptCount5,
          ],
          backgroundColor: 'rgb(75,192,192)',
          borderColor: 'rgb(255, 99, 132)',
        },
        {
          label: 'Rejected',
          data: [
            this.rejectCount1,
            this.rejectCount2,
            this.rejectCount3,
            this.rejectCount4,
            this.rejectCount5,
          ],
          backgroundColor: 'rgb(255,99,132)',
          borderColor: 'rgb(255, 159, 64)',
          type: 'bar',
        },
      ],
    };
    const myChart = new Chart('barchart', {
      type: 'scatter',
      data: data as any,
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }
}
interface ResponseItem {
  date: string;
  disbursed_count: number;
  rejected_count: number;
}
