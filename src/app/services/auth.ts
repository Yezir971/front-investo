import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { tap } from 'rxjs';

interface CredentialSignup {
  name:string ,
  lastname: string,
  email: string,
  password: string
}

@Injectable({
  providedIn: 'root',
})

export class AuthService {
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
  token = signal<string | null>(localStorage.getItem('auth_token'));


  public login(credential : {email: string, password: string}) {
    return this.http.post<{data : string, user: {id: string}}>(`${this.API_URL}/api/user/auth`, credential).pipe(
      tap(response => {
        this.coockieService.set('jwt_token', response.data, { 
          expires: 1,
          path: '/',
          secure: true, 
          sameSite: 'Strict' 
        });

        this.coockieService.set('user_id', response.user.id, { 
          expires: 1,
          path: '/',
          secure: true, 
          sameSite: 'Strict' 
        });
        localStorage.setItem('auth_token', response.data);
        this.token.set(response.data);

        this.currentUser.set(response);
      })
    )
  }

  public signup(credential:CredentialSignup){
    return this.http.post<{data : string}>(`${this.API_URL}/api/user/signup`, credential).pipe(
      tap(response => {
        console.log(response)
      })
    )
  }


  logout() {
    localStorage.removeItem('auth_token');
    this.token.set(null);
  }

  getToken(): string | null {
    return this.token();
  }

}
