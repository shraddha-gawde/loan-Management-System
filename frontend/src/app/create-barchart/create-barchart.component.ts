import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, inject, numberAttribute } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { AuthService } from '../auth.service';

Chart.register(...registerables)
@Component({
  selector: 'demo-create-barchart',
  standalone: true,
  imports: [HttpClientModule],
  templateUrl: './create-barchart.component.html',
  styleUrl: './create-barchart.component.css'
})
export class CreateBarchartComponent {
  httpClient = inject(HttpClient);

  readonly baseURL = 'http://localhost:8080/';

  
  ngOnInit(): void{
    this.RenderBarchart()
  }

constructor(private authService: AuthService){}

count1 = 0;
count2 = 0;
count3 = 0;
count4 = 0;
count5 = 0;

count1Label = '';
count2Label = '';
count3Label = '';
count4Label = '';
count5Label = '';
RenderBarchart() {
  const url = `${this.baseURL}dateCount`;
  this.httpClient
    .get<any>(url, {
      headers: this.authService.getTokenHeaders(),
    })
    .subscribe((Response) => {
      console.log(Response.data);
      Response.data.forEach((item: ResponseItem, index: number) => {
        switch (index) {
          case 0:
            this.count1Label = item.date;
            this.count1 = item.count;
            break;
          case 1:
            this.count2Label = item.date;
            this.count2 = item.count;
            break;
          case 2:
            this.count3Label = item.date;
            this.count3 = item.count;
            break;
          case 3:
            this.count4Label = item.date;
            this.count4 = item.count;
            break;
          case 4:
            this.count5Label = item.date;
            this.count5 = item.count;
            break;
          default:
            break;
        }
      });

      // Assign null to labels or counts that are not available
      this.count1Label = this.count1Label || '';
      this.count2Label = this.count2Label || '';
      this.count3Label = this.count3Label || '';
      this.count4Label = this.count4Label || '';
      this.count5Label = this.count5Label || '';
      this.count1 = this.count1 || 0;
      this.count2 = this.count2 || 0;
      this.count3 = this.count3 || 0;
      this.count4 = this.count4 || 0;
      this.count5 = this.count5 || 0;

      this.createChart();
    });
}

    createChart(){
      const data = {
        labels: [this.count1Label, this.count2Label, this.count3Label, this.count4Label, this.count5Label],
        datasets: [{
          label: 'Dailly Activity',
          data: [this.count1, this.count2,this.count3, this. count4, this.count5],
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(255, 159, 64, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            // 'rgba(153, 102, 255, 0.2)',
            // 'rgba(201, 203, 207, 0.2)'
          ],
          borderColor: [
            'rgb(255, 99, 132)',
            'rgb(255, 159, 64)',
            'rgb(153, 102, 255)',
            'rgb(75, 192, 192)',
            'rgb(54, 162, 235)',
            // 'rgb(153, 102, 255)',
            // 'rgb(201, 203, 207)'
          ],
          borderWidth: 1,
          
        }]
      };
      const myChart = new Chart('barchart', {
        type: 'bar',
        data: data,
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
interface ResponseItem {
  date: string;
  count: number;
}