import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

interface SoldeResponse {
  status: string;
  asset: string;
  balance: number;
  user_id: string;
}

interface StatusResponse {
  status: string;
  is_active: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class Dashboard {
  private http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:3000';

  infoClient(userId: string): Observable<SoldeResponse> {
    return this.http.get<SoldeResponse>(`${this.API_URL}/api/bot/solde/${userId}`);
  }

  botStatus(userId: string): Observable<StatusResponse> {
    return this.http.get<StatusResponse>(`${this.API_URL}/api/bot/status/${userId}`);
  }
}
