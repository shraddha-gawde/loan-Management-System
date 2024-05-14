import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
@Component({
  selector: 'demo-login',
  standalone: true,
  imports: [HttpClientModule, CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  errorMessage: string = '';


  constructor(private http: HttpClient, private router: Router) { }

  login(): void {
    if (!this.username || !this.password) {
      this.errorMessage = 'Please provide both username and password.';
      return;
    }

    this.http.post<any>('http://localhost:8080/user/login', { username: this.username, password: this.password })
      .subscribe({
        next: (response:any) => {
          localStorage.clear()
          console.log('Login successful:', response);
          localStorage.setItem("token", response.access_token)
          localStorage.setItem("user", JSON.stringify(response.user.username))
          localStorage.setItem("role",response.role.role)

          if(response.role.role === "admin"){
            this.router.navigate(['/adminDashboard']); 
          }

          else if(response.role.role === "seller"){
            this.router.navigate(['/sellerDashboard']); 
          }

          else if(response.role.role === "buyer"){
            this.router.navigate(['/buyerDashboard']); 
          }

          else if(response.role.role === "financier"){
            this.router.navigate(['/financierDashboard']); 
          }
        },
        error: (error:any) => {
          // Handle login error
          console.log(this.username)
          console.log(this.password)
          console.error('Login error:', error);
          if (error.status === 404) {
            this.errorMessage = 'enter your credientials...';
          } else if (error.status === 401) {
            this.errorMessage = 'User does not exist!';
          } else if (error.status === 400) {
            this.errorMessage = 'Password is incorrect!';
          }else {
            this.errorMessage = 'An unexpected error occurred. Please try again later.';
          }
        }
      });
  }
}
