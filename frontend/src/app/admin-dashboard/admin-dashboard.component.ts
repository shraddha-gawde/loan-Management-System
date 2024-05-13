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
import { FormsModule } from '@angular/forms';
import { PieChartAdminComponent } from '../pie-chart-admin/pie-chart-admin.component';
import { BarChartAdminComponent } from '../bar-chart-admin/bar-chart-admin.component';

@Component({
  selector: 'demo-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    HttpClientModule,
    FormsModule,
    PieChartAdminComponent,
    BarChartAdminComponent
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css',
})
export class AdminDashboardComponent implements OnInit {
  username: any;
  showDashboard = true;
  showAdministrators = false;
  showFinanciers = false;
  showSellers = false;
  showBuyers = false;
  roleID: any;

  constructor(private authService: AuthService) {}
  httpClient = inject(HttpClient);

  readonly baseURL = 'http://localhost:8080/';
  ngOnInit(): void {
    const userData = localStorage.getItem('user');
    this.username = userData ? JSON.parse(userData) : null;
    console.log(this.username);
    this.refreshData();
  }

  users: any[] = [];
  roleData: any;
  toggleRole(role: any): void {
    if (role == '1') {
      this.roleID = role;
      console.log(this.roleID);
    } else if (role == '2') {
      this.roleID = role;
      console.log(this.roleID);
    } else if (role == '3') {
      this.roleID = role;
      console.log(this.roleID);
    } else if (role == '4') {
      this.roleID = role;
      console.log(this.roleID);
    }
  }

  admin = 0;
  financier = 0;
  seller = 0;
  buyer = 0;
  refreshData() {
    this.toggleRole(this.roleID);

    this.httpClient
      .get(this.baseURL + `admin/users/${this.roleID}`, {
        headers: this.authService.getTokenHeaders(),
      })
      .subscribe((user: any) => {
        this.users = user.user_data;
        this.roleData = user.role;
        console.log(this.users);
      });

    this.httpClient
      .get<any>(`${this.baseURL}admin/count`, {
        headers: this.authService.getTokenHeaders(),
      })
      .subscribe((Response) => {
        console.log(Response);
        this.admin = Response[0].count;
        this.financier = Response[3].count;
        this.seller = Response[1].count;
        this.buyer = Response[2].count;
        console.log(this.admin);
        console.log(this.financier);
        console.log(this.seller);
        console.log(this.buyer);
      });
  }

  @ViewChild('myModal') model: ElementRef | undefined;
  userObj: User = new User();
  userList: User[] = [];

  editModel(user: any) {
    this.userObj = { ...user };
    console.log(this.userObj);
    const edit = document.getElementById('editbtn');
    const model = document.getElementById('myModal');
    if (model != null) {
      model.style.display = 'block';
    }
  }
  openModel() {
    const model = document.getElementById('myModal');
    if (model != null) {
      model.style.display = 'block';
    }
  }

  closeModel() {
    this.userObj = new User();
    if (this.model != null) {
      this.model.nativeElement.style.display = 'none';
    }
  }

  saveUser() {
    this.httpClient
      .post(this.baseURL + 'admin/user', this.userObj, {
        headers: this.authService.getTokenHeaders(),
      })
      .subscribe(
        (response) => {
          console.log('user added successfully:', response);
          this.refreshData();
          this.closeModel();
        },
        (error) => {
          console.error('Failed to add user:', error);
        }
      );
  }

  deleteUser(id: any) {
    this.httpClient
      .delete(this.baseURL + `admin/user/${id}`, {
        headers: this.authService.getTokenHeaders(),
      })
      .subscribe(
        (response) => {
          console.log('user deleted successfully:', response);
          this.refreshData();
          this.closeModel();
        },
        (error) => {
          console.error('user to add movie:', error);
        }
      );
  }
  editUser() {
    this.httpClient
      .patch(this.baseURL + `admin/user/${this.userObj.userID}`, this.userObj, {
        headers: this.authService.getTokenHeaders(),
      })
      .subscribe(
        (response) => {
          console.log(this.userObj);
          console.log('user updated successfully:', response);
          this.refreshData();
          this.closeModel();
        },
        (error) => {
          console.log(this.userObj.userID);
          console.error('Failed to update user:', error);
        }
      );
  }
}
export class User {
  userID: string = '';
  username: string = '';
  password: string = '';
  roleID: string = '';
  companyName: string = '';
  contactPerson: string = '';
  email: string = '';
  phone: string = '';
  address: string = '';
  city: string = '';
  country: string = '';
}
