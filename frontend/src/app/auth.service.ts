import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() { }

  getTokenHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    console.log(token)
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  
}