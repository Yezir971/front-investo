import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../services/auth';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { email, form, FormField, required } from '@angular/forms/signals';
import { HttpClient } from '@angular/common/http';


interface LoginData {
  email: string;
  password: string;
}

@Component({
  selector: 'app-login',
  imports: [FormsModule, FormField],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  loginModel = signal<LoginData>({
    email:'',
    password:'',
  })

  loginForm = form(this.loginModel, (schemaPath)=> {
    required(schemaPath.email, {message : 'Email est obligatoire.'})
    email(schemaPath.email, {message: "Email n'est pas valide." })
    required(schemaPath.password, {message : 'Mot de passe est obligatoire'})
  })


  private router = inject(Router);
  private authService = inject(AuthService)
  
  product: any;
  constructor(private http: HttpClient) { }

  onSubmit(event : Event){
    event.preventDefault();
    const credentials = this.loginModel()
    this.authService.login(credentials).subscribe({
      // todo : ajouter un toast 
      next: () => {
        this.router.navigate(['dashboard']);
      }
    })
  }
}
