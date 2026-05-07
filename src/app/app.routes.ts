import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { Signup } from './pages/signup/signup';
import { Dashboard } from './pages/dashboard/dashboard';
import { myGuardGuard } from './guards/my-guard-guard';

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
        component:Dashboard,
        canActivate:[myGuardGuard]
    }
];
