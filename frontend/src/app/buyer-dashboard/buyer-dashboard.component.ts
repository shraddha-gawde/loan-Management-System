import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';
import { FormsModule, NgForm, ReactiveFormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import { CreatePiechartComponent } from '../create-piechart/create-piechart.component';
import { CreateBarchartComponent } from '../create-barchart/create-barchart.component';




@Component({
  selector: 'demo-buyer-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule, CreatePiechartComponent, CreateBarchartComponent
  ],
  templateUrl: './buyer-dashboard.component.html',
  styleUrl: './buyer-dashboard.component.css',
})
export class BuyerDashboardComponent implements OnInit {
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
  pending= 0;
  disbursedNullAmount = 0
  disbursedNotNullAmount = 0 ;
  totalBatches = 0

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
      })
      this.httpClient
      .get<any>(`${this.baseURL}amountDisbusre`, {
        headers: this.authService.getTokenHeaders(),
      })
      .subscribe((Response) => {
        console.log(Response);
        this.disbursedNullAmount = Response.disbursedNullAmount;
        this.disbursedNotNullAmount = Response.disbursedNotNullAmount
        console.log(this.disbursedNullAmount) 
        console.log(this.disbursedNotNullAmount)
      })

      this.httpClient
      .get<any>(`${this.baseURL}totalBatches`, {
        headers: this.authService.getTokenHeaders(),
      })
      .subscribe((Response) => {
        console.log(Response);
        this.totalBatches = Response[0].count;
        console.log(this.totalBatches)
      })
    };
  constructor(private authService: AuthService, ) {}
  httpClient = inject(HttpClient);

  readonly baseURL = 'http://localhost:8080/';
  ngOnInit(): void {
    const userData = localStorage.getItem('user');
    this.username = userData ? JSON.parse(userData) : null;
    console.log(this.username);
    this.refreshData();
    this.generalData()
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
