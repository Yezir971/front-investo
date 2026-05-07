import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

interface KeyPayload {
  user_id: string;
  exchange: string;
  api_key: string;
  api_secret: string;
}

@Injectable({
  providedIn: 'root',
})
export class Keys {
  private http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:3000';

  send_key(data: KeyPayload): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.API_URL}/api/bot/keys`, data);
  }

  launch_bot(userId: string): Observable<{ status: string; message: string; is_active: boolean }> {
    return this.http.post<{ status: string; message: string; is_active: boolean }>(
      `${this.API_URL}/api/bot/start`,
      { user_id: userId }
    );
  }

  stop_bot(userId: string): Observable<{ status: string; message: string; is_active: boolean }> {
    return this.http.post<{ status: string; message: string; is_active: boolean }>(
      `${this.API_URL}/api/bot/stop`,
      { user_id: userId }
    );
  }
}
