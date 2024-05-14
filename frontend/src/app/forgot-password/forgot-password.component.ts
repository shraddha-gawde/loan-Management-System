import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'demo-forgot-password',
  standalone: true,
  imports: [HttpClientModule, FormsModule, CommonModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
  email: string = '';
  otp: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  showPasswordFields: boolean = false;
  errorMessage: string | null = null;
  
  constructor(private http: HttpClient, private router: Router) {}
  httpClient = inject(HttpClient);

  readonly baseURL = 'http://localhost:8080/';
  sendOTP() {
    this.httpClient.post<any>(`${this.baseURL}send-otp`, { email: this.email }).subscribe(
      (response) => {
        console.log(response);
        
          this.showPasswordFields = true;
        
          this.errorMessage = response.msg;
        
      },
      (error) => {
        if (error.status === 400) {
          // Bad request error, handle specific error messages
          if (error.error.msg === "Email is required") {
            this.errorMessage = "Email is required";
          } else if (error.error.msg === "Email is not registered") {
            this.errorMessage = "Email is not registered ... Please Enter Valid Email";
          }
           else {
            this.errorMessage = "Unknown error: " + error.error.msg;
          }
        } else {
          // Handle other types of errors (e.g., server errors)
          this.errorMessage = "Server error: " + error.message;
        }
      }
    );
  }
  
  
  resetPassword() {
    this.httpClient.patch<any>(`${this.baseURL}forgotPassword`, {
      email: this.email,
      password: this.newPassword,
      confirmPassword: this.confirmPassword,
      otp: this.otp
    }).subscribe(
      (response) => {
        console.log(response.msg);
        this.errorMessage = response.msg;
        
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      (error) => {
        console.error(error);
        this.errorMessage = error.msg;
      }
    );
  }
}
