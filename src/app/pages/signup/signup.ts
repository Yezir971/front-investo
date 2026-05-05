import { Component, inject, signal } from '@angular/core';
import { email, form, FormField, required } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

interface SignupData {
  name:string ,
  lastname: string,
  email: string,
  password: string
}

@Component({
  selector: 'app-signup',
  imports: [FormField],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})

export class Signup {
  signupModel = signal<SignupData>({
    name:"" ,
    lastname: "",
    email: "",
    password: ""
  })

  signupForm = form(this.signupModel, (schemaPath)=> {
    required(schemaPath.email, {message : 'Email est obligatoire.'})
    required(schemaPath.password, {message : 'Mot de passe est obligatoire'})
    required(schemaPath.name, {message : 'Le nom est obligatoire'})
    required(schemaPath.lastname, {message : 'Le prénom est obligatoire'})

    email(schemaPath.email, {message: "Email n'est pas valide." })
  })


  private router = inject(Router);
  private authService = inject(AuthService)

  onSubmit(event : Event){
    event.preventDefault();
    const credentials = this.signupModel()
    this.authService.signup(credentials).subscribe({
      next: () => {
        // todo : ajouter des toast avec le message votre inscription a bien été pris en compte
        console.log("information bien envoyer en bdd")
        this.router.navigate(['connexion']);
      }
    })
  }


}
