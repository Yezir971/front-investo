import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { tap } from 'rxjs';


@Injectable({
  providedIn: 'root',
})
export class Keys {
  private http = inject(HttpClient)
  private coockieService = inject(CookieService)
  private readonly API_URL = "http://localhost:3000"

  currentUser = signal<any | null>(null)

  public get isUserLoggedIn(){
    return !!(localStorage.getItem('jwt_token'));
  }
  public get userDetails(){
    return (localStorage.getItem('jwt_token'));
  }

  public send_key(data : {api_key : string, api_secret : string, user_id : string, exchange : string}) {
    return this.http.post<{data : string}>(`${this.API_URL}/api/bot/keys`, data).pipe(
      tap(response => {
        console.log(response)
      })
    )
  }

  public launch_bot(userId: string){
    return this.http.post<{data : string}>(`${this.API_URL}/api/bot/start`, { user_id: userId }).pipe(
      tap(response => {
        console.log(response)
      })
    )
  }

  public stop_bot(userId: string){
    return this.http.post<{data : string}>(`${this.API_URL}/api/bot/stop`, { user_id: userId }).pipe(
      tap(response => {
        console.log(response)
      })
    )
  }
}
