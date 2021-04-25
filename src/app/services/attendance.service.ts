import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Attendance} from '../models/attendance.model';

const API_URL = 'http://localhost:8080/api/attendance';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {

  constructor(private http: HttpClient) {
  }

  getAll(): Observable<Attendance[]> {
    return this.http.get<Attendance[]>(API_URL);
  }

  getAllByUser(user: any): Observable<Attendance[]> {
    return this.http.get<Attendance[]>(`${API_URL}/u/${user}`);
  }

  get(id: any): Observable<Attendance> {
    return this.http.get(`${API_URL}/${id}`);
  }

  create(data: any): Observable<any> {
    return this.http.post(API_URL, data);
  }

  update(id: any, data: any): Observable<any> {
    return this.http.put(`${API_URL}/${id}`, data);
  }

  updateByUser(id: any, user: any, data: any): Observable<any> {
    return this.http.put(`${API_URL}/u/${user}/${id}`, data);
  }

  delete(id: any): Observable<any> {
    return this.http.delete(`${API_URL}/${id}`);
  }

  deleteByUser(id: any, user: any): Observable<any> {
    return this.http.delete(`${API_URL}/u/${user}/${id}`);
  }
}
