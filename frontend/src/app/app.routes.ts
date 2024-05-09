import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { SellerDashboardComponent } from './seller-dashboard/seller-dashboard.component';
import { FinancierDashboardComponent } from './financier-dashboard/financier-dashboard.component';
import { BuyerDashboardComponent } from './buyer-dashboard/buyer-dashboard.component';
import { HomeComponent } from './home/home.component';
import { YourGuardGuard } from './app-guard.guard';
import { NotAuthorizedComponent } from './not-authorized/not-authorized.component';
import { NotFoundComponent } from './not-found/not-found.component';

export const routes: Routes = [
    {
        path: '',
        component: HomeComponent,
        title: 'home'
      },
      {
        path: 'login',
        component: LoginComponent,
        title: 'login page'
      },
      {
        path: 'adminDashboard',
        component: AdminDashboardComponent,
        canActivate: [YourGuardGuard],
        title: 'admin Dashboard'
      },
      {
        path: 'sellerDashboard',
        component: SellerDashboardComponent,
        canActivate: [YourGuardGuard],
        title: 'seller Dashboard'
      },
      {
        path: 'financierDashboard',
        component: FinancierDashboardComponent,
        canActivate: [YourGuardGuard],
        title: 'financier Dashboard'
      },
      {
        path: 'buyerDashboard',
        component: BuyerDashboardComponent,
        canActivate: [YourGuardGuard],
        title: 'buyer Dashboard'
      },
      {
        path: '401',
        component:NotAuthorizedComponent,
        title: '401'
      },
      { path: '**', component: NotFoundComponent }
];
