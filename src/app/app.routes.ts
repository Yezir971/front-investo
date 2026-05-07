import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { Signup } from './pages/signup/signup';
import { DashboardPage } from './pages/dashboard/dashboard';

export const routes: Routes = [
    {
        path:"",
        component:Home
    },
    {
        path:'connexion',
        component:Login
    },
    {
        path:'inscription',
        component:Signup
    },
    {
        path:'dashboard',
        component:DashboardPage
    }
];
