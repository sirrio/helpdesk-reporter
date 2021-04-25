import {Component, OnInit} from '@angular/core';
import {AttendanceService} from 'src/app/services/attendance.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Attendance} from '../../models/attendance.model';
import {DatePipe} from '@angular/common';
import {TokenStorageService} from '../../services/token-storage.service';

@Component({
  selector: 'app-attendance-details',
  templateUrl: './attendance-details.component.html',
  styleUrls: ['./attendance-details.component.css']
})
export class AttendanceDetailsComponent implements OnInit {
  private roles: string[] = [];
  isAdmin = false;
  isMod = false;
  isLoggedIn = false;
  username?: string;
  userid?: any;
  currentAttendance: Attendance = {
    date: this.datepipe.transform(new Date(), 'yyyy-MM-dd') || '1970-01-01',
    startTime: '10:00',
    endTime: '12:00',
    degreeCourse: '',
    faculty: '',
    mathBasic: false,
    mathLow: false,
    mathHigh: false,
    programming: false,
    physics: false,
    chemistry: false,
    organizational: false,
  };

  constructor(
    private attendanceService: AttendanceService,
    private tokenStorageService: TokenStorageService,
    private route: ActivatedRoute,
    private router: Router,
    public datepipe: DatePipe) {
  }

  ngOnInit(): void {
    this.isLoggedIn = !!this.tokenStorageService.getToken();
    if (this.isLoggedIn) {
      const user = this.tokenStorageService.getUser();
      this.username = user.username;
      this.roles = user.roles;
      this.userid = user.id;
      this.isAdmin = this.roles.includes('ROLE_ADMIN');
      this.isMod = this.roles.includes('ROLE_MODERATOR');
      this.getAttendance(this.route.snapshot.params.id);
    }
  }

  getAttendance(id: string): void {
    if (this.isMod) {
      this.attendanceService.get(id)
        .subscribe(
          data => {
            this.currentAttendance = data;
            console.log(data);
          },
          error => {
            console.log(error);
          });
    }
  }

  updateAttendance(): void {
    if (!this.isAdmin && this.isMod) {
      this.attendanceService.updateByUser(this.currentAttendance.id, this.userid, this.currentAttendance)
        .subscribe(
          response => {
            console.log(response);
            this.router.navigate(['/attendance']);
          },
          error => {
            console.log(error);
          });
    }
    if (this.isAdmin) {
      this.attendanceService.update(this.currentAttendance.id, this.currentAttendance)
        .subscribe(
          response => {
            console.log(response);
            this.router.navigate(['/attendance']);
          },
          error => {
            console.log(error);
          });
    }
  }

  deleteAttendance(): void {
    if (!this.isAdmin && this.isMod) {
      this.attendanceService.deleteByUser(this.currentAttendance.id, this.userid)
        .subscribe(
          response => {
            console.log(response);
            this.router.navigate(['/attendance']);
          },
          error => {
            console.log(error);
          });
    }
    if (this.isAdmin) {
      this.attendanceService.delete(this.currentAttendance.id)
        .subscribe(
          response => {
            console.log(response);
            this.router.navigate(['/attendance']);
          },
          error => {
            console.log(error);
          });
    }
  }
}
