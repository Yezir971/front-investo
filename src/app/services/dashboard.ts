import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Observable, tap } from 'rxjs';

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

@Injectable({
  providedIn: 'root',
})

export class Dashboard {
  private http = inject(HttpClient)
  private coockieService = inject(CookieService)
  private readonly API_URL = "http://localhost:3000"

  infoClient(userId: string): Observable<Config> {
    return this.http.get<Config>(`${this.API_URL}/api/bot/solde/${userId}`);
  }
}
