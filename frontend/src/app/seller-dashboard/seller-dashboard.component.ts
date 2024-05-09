import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';
import { FormsModule, NgForm, ReactiveFormsModule } from '@angular/forms';
import { CreateBarchartComponent } from '../create-barchart/create-barchart.component';
import { CreatePiechartComponent } from '../create-piechart/create-piechart.component';

@Component({
  selector: 'demo-seller-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    CreateBarchartComponent,
    CreatePiechartComponent
  ],
  templateUrl: './seller-dashboard.component.html',
  styleUrl: './seller-dashboard.component.css',
})
export class SellerDashboardComponent implements OnInit {
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


  constructor(private authService: AuthService) {}
  httpClient = inject(HttpClient);

  readonly baseURL = 'http://localhost:8080/';
  ngOnInit(): void {
    const userData = localStorage.getItem('user');
    this.username = userData ? JSON.parse(userData) : null;
    console.log(this.username);
    this.refreshData();
    this.generalData()
  }

generalData(){
  this.httpClient
      .get<any>(`${this.baseURL}allBatches`, {
        headers: this.authService.getTokenHeaders(),
      })
      .subscribe((Response) => {
        this.totalBatches = Response.totalBatchCount;
      })

      this.httpClient
      .get<any>(`${this.baseURL}amount`, {
        headers: this.authService.getTokenHeaders(),
      })
      .subscribe((Response) => {
        console.log(Response);
        this.disbursedNullAmount = Response.disbursedNullAmount;
        this.disbursedNotNullAmount = Response.disbursedNotNullAmount;
        this.pending = Response.disbursedNullCount
        console.log(this.disbursedNullAmount) 
        console.log(this.disbursedNotNullAmount)
      })

}



  batchObj: batchData = new batchData();
  batchList: batchData[] = [];


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
    if(this.showPrograms === true){
      this.refreshData();
    }if(this.addPrograms === true){
       this.showInvoice()
    }
  }

  refreshData() {
    const url = `${this.baseURL}batch?page=${this.currentPage}&limit=${this.limit}&BatchID=${this.BatchID}&status=${this.status}&fileName=${this.fileName}&region=${this.region}&programType=${this.programType}&sortBy=${this.sortBy}&sortOrder=${this.sortOrder}`;

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
  accepted: boolean = false;
  acceptedStatus: { [key: string]: boolean } = {};

  paginationSeller: any;
  showInvoice() {
    // this.parameterBatchID = batchid;
    console.log(this.parameterBatchID);
    const url = `${this.baseURL}invoices?page=${this.currentPage}&limit=${this.limit}&invoice_number=${this.invoice_number}&status=${this.status}&customer_name=${this.customer_name}&sortBy=${this.sortBy}&sortOrder=${this.sortOrder}`;

    this.httpClient
      .get<any>(url, {
        headers: this.authService.getTokenHeaders(),
      })
      .subscribe(
        (response) => {
          console.log(Headers);
          this.invoices.forEach((invoice) => {
            this.acceptedStatus[invoice.id] = invoice.status === 'accepted';
          });
          this.invoices = response.data;
          this.pagination = response.paginations;
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
  goToFirstPage() {
    if (this.pagination && this.pagination.currentPage !== 1) {
      this.currentPage = 1;
      this.refreshData();
    }
  }

  goToLastPageSeller() {
    if (
      this.pagination &&
      this.pagination.currentPage !== this.pagination.totalPages
    ) {
      this.currentPage = this.pagination.totalPages;
      this.showInvoice();
    }
  }
  goToFirstPageSeller() {
    if (this.pagination && this.pagination.currentPage !== 1) {
      this.currentPage = 1;
      this.showInvoice();
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
  prevPageSeller() {
    if (this.pagination && this.pagination.hasPreviousPage) {
      this.currentPage--;
      this.showInvoice();
    }
  }

  nextPageSeller() {
    if (this.pagination && this.pagination.hasNextPage) {
      console.log(this.currentPage);
      this.currentPage++;
      this.showInvoice();
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
          console.log(Headers);

          // Assign index to each invoice
          this.invoices = response.data.map((invoice: any, index: number) => {
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
              index: index, 
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
    console.log(id);
    this.expandedIndex = this.expandedIndex === index ? -1 : index;
    this.selectedInvoiceId = id;
    console.log(this.selectedInvoiceId);
    this.httpClient
      .get(this.baseURL + `invoice/${id}`, {
        headers: this.authService.getTokenHeaders(),
      })
      .subscribe(
        (response: any) => {
          console.log(response);
          this.invoice = response.data;
        },
        (error: any) => {
          console.error('Failed to fetch invoice details:', error);
        }
      );
  }
  @ViewChild('myModalAccept') model1: ElementRef | undefined;
  @ViewChild('myModalReject') model2: ElementRef | undefined;
  selectedInvoiceId: string = '';

  openModelReject(index: number) {
    if (index !== undefined && index >= 0 && index < this.invoices.length) {
      const model = document.getElementById('myModalReject');
      
      if (model != null) {
         const invoice = this.invoices[index];
        this.selectedInvoiceId = invoice.id;
        console.log(this.selectedInvoiceId);
        console.log(invoice);
        model.style.display = 'block';
      }
    } else {
      console.error('Invalid invoice index:', index);
    }
  }

  closeModelReject() {
    if (this.model2) {
      this.model2.nativeElement.style.display = 'none';
      this.getInvoiceData(this.parameterBatchID)
    }
  }
  

  openModelaccept(index: number) {
    if (index !== undefined && index >= 0 && index < this.invoices.length) {
      const model = document.getElementById('myModalAccept');
      if (model != null) {
        const invoice = this.invoices[index];
        this.selectedInvoiceId = invoice.id;
        console.log(this.selectedInvoiceId);
        console.log(invoice);
        model.style.display = 'block';
      }
    } else {
      console.error('Invalid invoice index:', index);
    }
  }

  closeModelAccept() {
    if (this.model1) {
      this.model1.nativeElement.style.display = 'none';
      this.getInvoiceData(this.parameterBatchID)
    }
  }

  acceptInvoice() {
    const headers = this.authService.getTokenHeaders();
    const id = this.selectedInvoiceId;
    const url = `${this.baseURL}accept/${id}`;
    this.httpClient
      .patch<any>(url, status, {
        headers,
      })
      .subscribe(
        (response) => {
          console.log(id);
          console.log(response);
          this.acceptedStatus[id] = true;
          this.closeModelAccept();
          this.refreshData();
        },
        (error) => {
          console.log(id);
          console.error('Error:', error);
          console.log(this.authService.getTokenHeaders());
          this.errorMessage = 'Internal Server Error';
        }
      );
  }

  rejectInvoice() {
    const headers = this.authService.getTokenHeaders();
    const id = this.selectedInvoiceId;
    const url = `${this.baseURL}reject/${id}`;
    this.httpClient
      .patch<any>(url, status, {
        headers,
      })
      .subscribe(
        (response) => {
          console.log(id);
          console.log(response);
          this.acceptedStatus[id] = true;
          this.closeModelReject();
          this.refreshData();
        },
        (error) => {
          console.log(id);
          console.error('Error:', error);
          console.log(this.authService.getTokenHeaders());
          this.errorMessage = 'Internal Server Error';
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
  createdAt: string = '';
}
