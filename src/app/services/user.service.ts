import {Injectable, isDevMode} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {User} from '../models/user.model';

let API_URL: string;

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private http: HttpClient) {
    if (isDevMode()) {
      API_URL = 'http://localhost:8080/api/user';
    } else {
      API_URL = 'http://134.122.90.155:8080/api/user';
    }
  }

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(API_URL);
  }

  get(id: any): Observable<User> {
    return this.http.get(`${API_URL}/${id}`);
  }
}
