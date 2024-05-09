import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class YourGuardGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    // check if the user is authenticated
    const isAuthenticatedToken = localStorage.getItem('token');
    const isAuthenticatedRole = localStorage.getItem('role');

    console.log(isAuthenticatedRole);
    console.log(isAuthenticatedToken);

      if(state.url === "/adminDashboard" && isAuthenticatedRole == "admin" && isAuthenticatedToken){
        return true
      }
      else if(state.url === "/buyerDashboard" && isAuthenticatedRole == "buyer" && isAuthenticatedToken){
        return true
      }

      else if(state.url === "/sellerDashboard" && isAuthenticatedRole == "seller" && isAuthenticatedToken){
        return true
      }

      else if(state.url === "/financierDashboard" && isAuthenticatedRole == "financier" && isAuthenticatedToken){
        return true
      }
     else {
      this.router.navigate(['/401'], {
        queryParams: { returnUrl: state.url },
      })
      return false
    }
  }
  logout(): void {
    localStorage.removeItem('token')
    this.router.navigate(['/login'])
  }
}
