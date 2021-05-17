import {Injectable, isDevMode} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';

let API_URL: string;

const httpOptions = {
  headers: new HttpHeaders({'Content-Type': 'application/json'})
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private http: HttpClient) {
    if (isDevMode()) {
      API_URL = 'http://localhost:8080/api/auth/';
    } else {
      API_URL = 'http://134.122.90.155:8080/api/auth/';
    }
  }

  login(username: string, password: string): Observable<any> {
    return this.http.post(API_URL + 'signin', {
      username,
      password
    }, httpOptions);
  }

  register(username: string, email: string, password: string): Observable<any> {
    return this.http.post(API_URL + 'signup', {
      username,
      email,
      password
    }, httpOptions);
  }
}
