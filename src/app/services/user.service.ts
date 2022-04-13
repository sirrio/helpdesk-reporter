import {Injectable, isDevMode} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {User} from '../models/user.model';

let API_URL: string;

const httpOptions = {
  headers: new HttpHeaders({'Content-Type': 'application/json'})
};

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

  updateRole(id: any, role: string, rm: boolean): Observable<User> {
    return this.http.post(`${API_URL}/admin/`, {id, role, rm}, httpOptions);
  }

  updatePassword(id: any, password: string): Observable<User> {
    return this.http.post(`${API_URL}/password/`, {id, password}, httpOptions);
  }
}
