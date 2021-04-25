import {Component, OnInit} from '@angular/core';
import {Attendance} from '../../models/attendance.model';
import {AttendanceService} from 'src/app/services/attendance.service';
import {DatePipe} from '@angular/common';
import {groupBy, mergeMap, toArray} from 'rxjs/operators';
import {TokenStorageService} from '../../services/token-storage.service';
import {UserService} from '../../services/user.service';
import {saveAs} from 'file-saver';

@Component({
  selector: 'app-attendance-list',
  templateUrl: './attendance-list.component.html',
  styleUrls: ['./attendance-list.component.css']
})
export class AttendanceListComponent implements OnInit {
  private roles: string[] = [];
  AttendancesByDate?: Attendance[][];
  isAdmin = false;
  isMod = false;
  isLoggedIn = false;
  username?: string;
  userid?: any;
  tmpAttendance: Attendance = {
    semester: 'SS21',
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
    tutor: 0
  };

  constructor(
    private attendanceService: AttendanceService,
    private userService: UserService,
    private tokenStorageService: TokenStorageService,
    public datepipe: DatePipe) {
  }

  ngOnInit(): void {
    this.AttendancesByDate = [];

    this.isLoggedIn = !!this.tokenStorageService.getToken();
    if (this.isLoggedIn) {
      const user = this.tokenStorageService.getUser();
      this.username = user.username;
      this.roles = user.roles;
      this.userid = user.id;
      this.isAdmin = this.roles.includes('ROLE_ADMIN');
      this.isMod = this.roles.includes('ROLE_MODERATOR');
      this.retrieveAttendance();
    }
  }

  retrieveAttendance(): void {
    this.AttendancesByDate = [];
    if (this.isAdmin) {
      this.attendanceService.getAll()
        .pipe(
          mergeMap(res => res),
          groupBy(attendance => attendance.date),
          mergeMap(group => group.pipe(toArray()))
        ).subscribe(data => {
        this.AttendancesByDate?.push(data);
      });
    }
    if (!this.isAdmin ?? this.isMod) {
      this.attendanceService.getAllByUser(this.userid)
        .pipe(
          mergeMap(res => res),
          groupBy(attendance => attendance.date),
          mergeMap(group => group.pipe(toArray()))
        ).subscribe(data => {
        this.AttendancesByDate?.push(data);
      });
    }
  }

  downloadFile(data: any): void {
    console.log(data);
    const replacer = (key: any, value: null) => value === null ? '' : value; // specify how you want to handle null values here
    const header = Object.keys(data[0]);
    const csv = data.map((row: { [x: string]: any; }) => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','));
    csv.unshift(header.join(','));
    const csvArray = csv.join('\r\n');

    const blob = new Blob([csvArray], {type: 'text/csv'});
    saveAs(blob, 'myFile.csv');
  }

  saveAttendance(): void {
    const data = {
      semester: 'SS21',
      date: this.tmpAttendance.date,
      startTime: this.tmpAttendance.startTime,
      endTime: this.tmpAttendance.endTime,
      degreeCourse: this.tmpAttendance.degreeCourse,
      faculty: this.tmpAttendance.faculty,
      mathBasic: this.tmpAttendance.mathBasic,
      mathLow: this.tmpAttendance.mathLow,
      mathHigh: this.tmpAttendance.mathHigh,
      programming: this.tmpAttendance.programming,
      physics: this.tmpAttendance.physics,
      chemistry: this.tmpAttendance.chemistry,
      organizational: this.tmpAttendance.organizational,
      tutor: this.userid
    };

    this.attendanceService.create(data)
      .subscribe(
        response => {
          console.log(response);
          this.retrieveAttendance();
        },
        error => {
          console.log(error);
        });
  }

  formatDate(input?: string): string {
    const [yy, mm, dd] = input?.split('-') || [];
    return `${dd}.${mm}.${yy}`;
  }

  getWeekday(input?: string): string {
    const wd = new Date(input || '1970-01-01');
    switch (wd.getDay()) {
      case 0:
        return 'Sonntag';
      case 1:
        return 'Montag';
      case 2:
        return 'Dienstag';
      case 3:
        return 'Mittwoch';
      case 4:
        return 'Donnerstag';
      case 5:
        return 'Freitag';
      default:
        return 'Samstag';
    }
  }
}
