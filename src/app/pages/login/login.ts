import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private router = inject(Router);
  private authService = inject(AuthService)
  credentials = {email: "", password: ""}
  onSubmit(){
    this.authService.login(this.credentials).subscribe({
      next: () => {
        this.router.navigate(['']);
      }
    })
  }
}
