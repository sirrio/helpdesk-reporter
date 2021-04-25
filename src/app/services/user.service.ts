import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {User} from '../models/user.model';

const API_URL = 'http://localhost:8080/api/user/';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private http: HttpClient) {
  }

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(API_URL);
  }

  get(id: any): Observable<User> {
    return this.http.get(`${API_URL}/${id}`);
  }
}
