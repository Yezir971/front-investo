import { Component, inject, signal, effect } from '@angular/core';
import { email, form, FormField, required } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { Keys } from '../../services/keys';
import { CookieService } from 'ngx-cookie-service';

interface ApiKeyData {
  api_key : string,
  api_secret : string,
  exchange : string,
  user_id : string
}

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})

export class Dashboard {
  private cookieService = inject(CookieService);
  private router = inject(Router);
  private keysService = inject(Keys);

  signupModel = signal<ApiKeyData>({
    api_key:"" ,
    api_secret: "",
    exchange: "Crypto.com",
    user_id: this.cookieService.get('user_id') || ""
  })
  
  signupForm = form(this.signupModel, (schemaPath)=> {
    required(schemaPath.api_key, {message : 'La clé API est obligatoire.'})
    required(schemaPath.api_secret, {message : 'Le secret API est obligatoire.'})
    required(schemaPath.exchange, {message : 'L\'échange est obligatoire.'})
  })
  onSubmit(event : Event){
    event.preventDefault();
    const apiKeyData = this.signupModel()
    this.keysService.send_key(apiKeyData).subscribe({
      next: () => {
        console.log("information bien envoyer en bdd")
        this.router.navigate(['dashboard']);
      }
    })
  }
}
