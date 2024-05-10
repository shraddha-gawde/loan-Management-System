import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  inject,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';
import { FormsModule, NgForm, ReactiveFormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import { CreatePiechartComponent } from '../create-piechart/create-piechart.component';
import { CreateBarchartComponent } from '../create-barchart/create-barchart.component';
import jsPDF from 'jspdf';

import html2canvas from 'html2canvas';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
@Component({
  selector: 'demo-buyer-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    CreatePiechartComponent,
    CreateBarchartComponent,
  ],
  templateUrl: './buyer-dashboard.component.html',
  styleUrl: './buyer-dashboard.component.css',
})
export class BuyerDashboardComponent implements OnInit {
  genarateReport = false;
  username: any;
  showDashboard = true;
  showAdministrators = false;
  batchTable = false;
  showinvoices = false;
  addPrograms = false;
  showPrograms = false;
  programs = false;
  showSerchData = false;
  showInvoieData = false;
  uploadStatus: string = '';
  uploadBOX = false;
  roleID: any;
  pending = 0;
  disbursedNullAmount = 0;
  disbursedNotNullAmount = 0;
  totalBatches = 0;

  generalData() {
    const url = `${this.baseURL}statusCount`;

    this.httpClient
      .get<any>(url, {
        headers: this.authService.getTokenHeaders(),
      })
      .subscribe((Response) => {
        console.log(Response.data);
        this.pending =
          Response.data.find(
            (item: InvoiceStatus) => item.status === 'uploaded'
          )?.count || 0;
      });
    this.httpClient
      .get<any>(`${this.baseURL}amountDisbusre`, {
        headers: this.authService.getTokenHeaders(),
      })
      .subscribe((Response) => {
        console.log(Response);
        this.disbursedNullAmount = Response.disbursedNullAmount;
        this.disbursedNotNullAmount = Response.disbursedNotNullAmount;
        console.log(this.disbursedNullAmount);
        console.log(this.disbursedNotNullAmount);
      });

    this.httpClient
      .get<any>(`${this.baseURL}totalBatches`, {
        headers: this.authService.getTokenHeaders(),
      })
      .subscribe((Response) => {
        console.log(Response);
        this.totalBatches = Response[0].count;
        console.log(this.totalBatches);
      });
  }
  constructor(
    private authService: AuthService,
    private elementRef: ElementRef
  ) {}
  httpClient = inject(HttpClient);

  readonly baseURL = 'http://localhost:8080/';
  ngOnInit(): void {
    const userData = localStorage.getItem('user');
    this.username = userData ? JSON.parse(userData) : null;
    console.log(this.username);
    this.refreshData();
    this.generalData();
  }

  batchObj: batchData = new batchData();
  batchList: batchData[] = [];

  saveBatchData() {
    const formData = new FormData();
    formData.append('pancard', this.batchObj.pancard);
    formData.append('BatchID', this.batchObj.BatchID);
    formData.append('region', this.batchObj.region);
    formData.append('programType', this.batchObj.programType);
    formData.append('name', this.batchObj.name);
    formData.append('invoiceFile', this.batchObj.invoiceFile);

    this.httpClient
      .post(this.baseURL + 'buyer/upload', formData, {
        headers: this.authService.getTokenHeaders(),
      })
      .subscribe(
        (response: any) => {
          this.uploadStatus = 'success';
          console.log('Data added successfully:', response);
        },
        (error: any) => {
          this.uploadStatus = 'error';
          console.error('Failed to add data:', error);
        }
      );
  }
  handleFileInput(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      this.batchObj.invoiceFile = event.target.files[0];
      console.log(this.batchObj.BatchID);
      console.log(this.batchObj.invoiceFile);
    }
  }
  currentPage = 1;
  limit = 10;
  BatchID: string = '';
  status: string = '';
  fileName: string = '';
  region: string = '';
  programType: string = '';
  sortBy: string = '';
  sortOrder: string = 'ASC';
  batches: any[] = [];
  pagination: any;
  errorMessage: string = '';
  sortDirection: string = 'asc';

  sortData(column: string) {
    if (this.sortBy === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      this.sortOrder = this.sortOrder === 'ASC' ? 'DESC' : 'ASC';
    } else {
      this.sortBy = column;
      this.sortDirection = 'asc';
    }
    this.refreshData();
  }

  refreshData() {
    const url = `${this.baseURL}batches?page=${this.currentPage}&limit=${this.limit}&BatchID=${this.BatchID}&status=${this.status}&fileName=${this.fileName}&region=${this.region}&programType=${this.programType}&sortBy=${this.sortBy}&sortOrder=${this.sortOrder}`;

    this.httpClient
      .get<any>(url, {
        headers: this.authService.getTokenHeaders(),
      })
      .subscribe(
        (response) => {
          this.batches = response.batchFiles.map((batch: any) => {
            const createDate = new Date(batch.createdAt);
            const months = [
              'Jan',
              'Feb',
              'March',
              'Apr',
              'May',
              'June',
              'July',
              'Aug',
              'Sep',
              'Oct',
              'Nov',
              'Dec',
            ];
            const formattedCreateDate = `${createDate.getDate()} ${
              months[createDate.getMonth()]
            }, ${createDate.getFullYear()}`;
            return {
              ...batch,
              createdAt: formattedCreateDate,
            };
          });
          this.pagination = response.pagination;
          console.log(this.batches);
          this.calculateRange();
        },
        (error) => {
          console.error('Error:', error);
          this.errorMessage = 'Internal Server Error';
        }
      );
  }

  startIndex: number = 0;
  endIndex: number = 0;

  calculateRange() {
    if (this.pagination && this.pagination.totalEntries > 0) {
      this.startIndex =
        (this.pagination.currentPage - 1) * this.pagination.limit + 1;

      this.endIndex = Math.min(
        this.pagination.currentPage * this.pagination.limit,
        this.pagination.totalEntries
      );
    } else {
      this.startIndex = 0;
      this.endIndex = 0;
    }
  }
  prevPage() {
    if (this.pagination && this.pagination.hasPreviousPage) {
      this.currentPage--;
      this.refreshData();
    }
  }

  nextPage() {
    if (this.pagination && this.pagination.hasNextPage) {
      console.log(this.currentPage);
      this.currentPage++;
      this.refreshData();
    }
  }
  goToFirstPage() {
    if (this.pagination && this.pagination.currentPage !== 1) {
      this.currentPage = 1;
      this.refreshData();
    }
  }

  goToLastPage() {
    if (
      this.pagination &&
      this.pagination.currentPage !== this.pagination.totalPages
    ) {
      this.currentPage = this.pagination.totalPages;
      this.refreshData();
    }
  }
  getStatusClass(status: string): string {
    switch (status) {
      case 'uploaded':
        return 'status-uploaded';
      case 'rejected':
        return 'status-rejected';
      case 'accepted':
        return 'status-accepted';
      case 'disbursed':
        return 'status-disbursed';
      case 'partially accepted':
        return 'status-partially-accepted';
      default:
        return '';
    }
  }

  invoice_number: string = '';
  customer_name: string = '';
  invoices: any[] = [];
  parameterBatchID: string = '';

  getInvoiceData(batchid: string) {
    this.parameterBatchID = batchid;
    console.log(this.parameterBatchID);
    const url = `${this.baseURL}invoices/${batchid}?page=${this.currentPage}&limit=${this.limit}&invoice_number=${this.invoice_number}&status=${this.status}&customer_name=${this.customer_name}&sortBy=${this.sortBy}&sortOrder=${this.sortOrder}`;

    this.httpClient
      .get<any>(url, {
        headers: this.authService.getTokenHeaders(),
      })
      .subscribe(
        (response) => {
          this.invoices = response.data.map((invoice: any) => {
            const invoiceDate = new Date(invoice.invoice_date);
            const dueDate = new Date(invoice.due_date);
            const months = [
              'Jan',
              'Feb',
              'March',
              'Apr',
              'May',
              'June',
              'July',
              'Aug',
              'Sep',
              'Oct',
              'Nov',
              'Dec',
            ];
            const formattedInvoiceDate = `${invoiceDate.getDate()} ${
              months[invoiceDate.getMonth()]
            }, ${invoiceDate.getFullYear()}`;
            const formattedDueDate = `${dueDate.getDate()} ${
              months[dueDate.getMonth()]
            }, ${dueDate.getFullYear()}`;
            return {
              ...invoice,
              invoice_date: formattedInvoiceDate,
              due_date: formattedDueDate,
            };
          });
          this.pagination = response.pagination;
          this.BatchID = response.BatchID;
          console.log(this.invoices);
          this.calculateRange();
          console.log(this.pagination);
        },
        (error) => {
          console.error('Error:', error);
          this.errorMessage = 'Internal Server Error';
        }
      );
  }

  invoice: any = [];
  expandedIndex: number = -1;

  toggleInvoiceDetails(index: number, id: string) {
    this.expandedIndex = this.expandedIndex === index ? -1 : index;

    this.httpClient
      .get(this.baseURL + `invoice/${id}`, {
        headers: this.authService.getTokenHeaders(),
      })
      .subscribe(
        (response: any) => {
          console.log(response.data);
          this.invoice = response.data;
        },
        (error: any) => {
          console.error('Failed to fetch invoice details:', error);
        }
      );
  }

  sortInvoices(column: string) {
    if (this.sortBy === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      this.sortOrder = this.sortOrder === 'ASC' ? 'DESC' : 'ASC';
    } else {
      this.sortBy = column;
      this.sortDirection = 'asc';
    }
    this.getInvoiceData(this.parameterBatchID);
  }

  trackByFn(index: number, item: any): any {
    return item.id;
  }

  // generateReport: boolean = true;
  startDate: string = '';
  endDate: string = '';
  reportType: string = 'summary';
  reportData: any;
  generateAndDisplayReport(): void {
    const requestBody = {
      startDate: this.startDate,
      endDate: this.endDate,
      reportType: this.reportType,
    };

    this.httpClient
      .post<any>(`${this.baseURL}report`, requestBody, {
        headers: this.authService.getTokenHeaders(),
      })
      .subscribe(
        (response) => {
          // Display the generated report data
          this.reportData = response;
          console.log(this.reportData);
          // console.log(this.reportData)
        },
        (error) => {
          console.error('Error generating report:', error);
        }
      );
  }

  @ViewChild('content', { static: false }) el!: ElementRef;
  @ViewChild('detailedcontent', { static: false }) detailed!: ElementRef;
  
  
  exportReport(format: string): void {
    if (format === 'pdf') {
      if (this.reportType === 'summary') {
        const pdf = new jsPDF('p', 'pt', 'a4', true);
        console.log(this.el);
        pdf.html(this.el.nativeElement, {
          width: 200,
          callback: (pdf) => {
            const pdfFile = pdf.output('blob');
            FileSaver.saveAs(pdfFile, 'Summary_report.pdf');
          },
        });
      } else if (this.reportType === 'detailed') {
        const pdf = new jsPDF('l', 'pt', 'a4', true);
        console.log(this.detailed);
        pdf.html(this.detailed.nativeElement, {
          width: 200,
          callback: (pdf) => {
            const pdfFile = pdf.output('blob');
            FileSaver.saveAs(pdfFile, 'Detailed_report.pdf');
          },
        });
      }

      // const options = { background: 'white', scale: 3 };

      // const reportResult = this.elementRef.nativeElement.querySelector('#reportResult');
      // let content: string;

      // if (this.reportType === 'summary') {
      //   content = this.generateSummaryContent();
      // } else if (this.reportType === 'detailed') {
      //   content = this.generateDetailedContent();
      // } else {
      //   console.error('Invalid report type specified.');
      //   return;
      // }

      // if (reportResult) {
      //   pdf.text(content, 10, 10);
      //   const pdfFile = pdf.output('blob');
      //   FileSaver.saveAs(pdfFile, 'report.pdf');
      // } else {
      //   console.error('Report result element not found.');
      // }
    }else if (format === 'csv') {
      const reportResult = document.getElementById('reportResult');
      if (reportResult) {
        const tables = Array.from(reportResult.querySelectorAll('table'));
        if (tables.length > 0) {
          const wb = XLSX.utils.book_new();
    
          tables.forEach((table, index) => {
            const rows = Array.from(table.querySelectorAll('tr'));
            const csvContent = rows.map((row) => {
              const rowData = Array.from(row.querySelectorAll('td, th'))
                .map((cell) => cell.textContent)
                .join(',');
              return rowData;
            }).join('\n');
    
            const ws = XLSX.utils.aoa_to_sheet(csvContent.split('\n').map(row => row.split(',')));
            XLSX.utils.book_append_sheet(wb, ws, ['Accepted', 'Rejected', 'Disbursed', 'All batches'][index]);
          });
    
          const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
          const blob = new Blob([s2ab(wbout)], { type: 'application/octet-stream' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'report.xlsx';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        } else {
          console.error('Table elements not found in report result.');
        }
      } else {
        console.error('Report result element not found.');
      }
    } else {
      console.error('Invalid format specified.');
    }
    
    function s2ab(s: string) {
      const buf = new ArrayBuffer(s.length);
      const view = new Uint8Array(buf);
      for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
      return buf;
    }
    
    
  }

  // private generateSummaryContent(): string {
  //   return `Generated Report\n
  //       creator : ${this.reportData.user.username}\n
  //       company Name : ${this.reportData.user.companyName}\n
  //       contact email : ${this.reportData.user.email}\n
    
  //       summary:
  //       Total Batch Created: ${this.reportData.totalBatchCount} Batches\n
  //       Total uploaded invoices: ${this.reportData.invoiceCounts[3].count} Invoices\n
  //       Total disbursed invoices: ${this.reportData.invoiceCounts[0].count} Invoices\n
  //       Total accepted invoices: ${this.reportData.invoiceCounts[1].count} Invoices\n
  //       Total rejected invoices: ${this.reportData.invoiceCounts[2].count} Invoices\n
    
  //       Amount Distribution : \n
  //       total Disbursed Amounts: ${this.reportData.disbursedNotNullAmount} INR\n
  //       total pending Disbursed Amounts: ${this.reportData.disbursedNullAmount} INR\n
    
  //       Date Wise Invoice Creation : \n
  //       ${this.reportData.latestFiveDates[0].date}: ${this.reportData.latestFiveDates[0].count} Invoices\n
  //       ${this.reportData.latestFiveDates[1].date}: ${this.reportData.latestFiveDates[1].count} Invoices\n
  //       ${this.reportData.latestFiveDates[2].date}: ${this.reportData.latestFiveDates[2].count} Invoices\n
  //     `;
  // }

  // private generateDetailedContent(): string {
  //   // Generate detailed content based on your requirements
  //   return 'Detailed Report Content';
  // }
}
export class batchData {
  id: string = '';
  name: string = '';
  email: string = '';
  BatchID: string = '';
  pancard: string = '';
  programType: string = '';
  region: string = '';
  fileName: string = '';
  status: string = '';
  invoiceFile: string = '';
  createdAt: Date | null = null;
}
interface InvoiceStatus {
  status: string;
  count: number;
}
