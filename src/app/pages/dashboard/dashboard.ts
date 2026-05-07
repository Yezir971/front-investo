import { Component, inject, signal, effect } from '@angular/core';
import { email, form, FormField, required } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { Keys } from '../../services/keys';
import { CookieService } from 'ngx-cookie-service';
import { Dashboard as DashboardService } from '../../services/dashboard';
// import { } from '@angular/forms/signals';

interface ApiKeyData {
  api_key : string,
  api_secret : string,
  exchange : string,
  user_id : string
}

interface Config {
  data: string,
  status: string,
  user: {
    email: string,
    id: string,
    name: string,
    virtual_balance: number
   }
}

@Component({
  selector: 'app-dashboard',
  imports: [FormField],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})

export class Dashboard {
  private cookieService = inject(CookieService);
  private router = inject(Router);
  private keysService = inject(Keys);
  private dashboard = inject(DashboardService);

  config = signal<Config | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  apiKeyModel = signal<ApiKeyData>({
    api_key:"" ,
    api_secret: "",
    exchange: "Crypto.com",
    user_id: this.cookieService.get('user_id') || ""
  })
  
  apiKeyForm = form(this.apiKeyModel, (schemaPath)=> {
    required(schemaPath.api_key, {message : 'La clé API est obligatoire.'})
    required(schemaPath.api_secret, {message : 'Le secret API est obligatoire.'})
    required(schemaPath.exchange, {message : 'L\'échange est obligatoire.'})
  })
  constructor() {
    this.InitGetConfig();
  }
  onSubmit(event : Event){
    event.preventDefault();
    const apiKeyData = this.apiKeyModel()
    this.keysService.send_key(apiKeyData).subscribe({
      next: () => {
        console.log("information bien envoyer en bdd")
        this.router.navigate(['dashboard']);
      }
    })
  }

  onLaunchBot(event : Event){
    event.preventDefault();
    this.keysService.launch_bot(this.cookieService.get('user_id') || "").subscribe({
      next: () => {
        console.log("Bot launched successfully")
        this.router.navigate(['dashboard']);
      }
    })
  }

  onStopBot(event : Event){
    event.preventDefault();
    this.keysService.stop_bot(this.cookieService.get('user_id') || "").subscribe({
      next: () => {
        console.log("Bot stopped successfully")
        this.router.navigate(['dashboard']);
      }
    })
  }

  InitGetConfig(){
    const userId = this.cookieService.get('user_id') || ""
    if (!userId) {
      this.error.set('Utilisateur non connecté');
      return;
    }
    this.loading.set(true);
    this.dashboard.infoClient(userId).subscribe(config => {
      this.config.set(config);
      this.loading.set(false);
    }, error => {
      this.error.set('Erreur lors de la récupération des données');
      this.loading.set(false);
    });
  }

}
