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
    semester: 'SS22',
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

  semester: string[] = ['SS22', 'WS2122', 'SS21'];
  currentSemester = 'SS22';

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
    if (this.isAdmin && this.currentSemester === 'all') {
      this.attendanceService.getAll()
        .pipe(
          mergeMap(res => res),
          groupBy(attendance => attendance.date),
          mergeMap(group => group.pipe(toArray()))
        ).subscribe(data => {
        this.AttendancesByDate?.push(data);
      });
    }
    if (this.isAdmin && this.currentSemester !== 'all') {
      this.attendanceService.getAllBySemester(this.currentSemester)
        .pipe(
          mergeMap(res => res),
          groupBy(attendance => attendance.date),
          mergeMap(group => group.pipe(toArray()))
        ).subscribe(data => {
        this.AttendancesByDate?.push(data);
      });
    }
    if (!this.isAdmin && this.isMod && this.currentSemester === 'all') {
      this.attendanceService.getAllByUser(this.userid)
        .pipe(
          mergeMap(res => res),
          groupBy(attendance => attendance.date),
          mergeMap(group => group.pipe(toArray()))
        ).subscribe(data => {
        this.AttendancesByDate?.push(data);
      });
    }
    if (!this.isAdmin && this.isMod && this.currentSemester !== 'all') {
      this.attendanceService.getAllByUserAndSemester(this.userid, this.currentSemester)
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
    const nullReplacer = (key: any, value: null) => value === null ? '' : value;

    const csv = [];
    let tmp = [];
    tmp.push(
      'Wochentag',
      'Datum',
      'von',
      'bis',
      'Studiengang',
      'Fachrichtung',
      'Mathe Grundlagen aus Schule',
      'Mathe 1. oder 2. Semester',
      'Mathe ab 3. Semester',
      'Programmieren',
      'Physik',
      'Chemie',
      'Orgranisatoisches',
      'Tutor'
    );
    csv.push(tmp.join(';'));
    for (const d of data) {
      for (const x of d) {
        tmp = [];
        const attendance: Attendance = x;
        tmp.push(
          this.getWeekday(attendance.date),
          attendance.date,
          attendance.startTime,
          attendance.endTime,
          attendance.degreeCourse,
          attendance.faculty,
          this.mark(attendance.mathBasic),
          this.mark(attendance.mathLow),
          this.mark(attendance.mathHigh),
          this.mark(attendance.programming),
          this.mark(attendance.physics),
          this.mark(attendance.chemistry),
          this.mark(attendance.organizational),
          attendance.tutor.username
        );
        csv.push(tmp.join(';'));
      }
    }
    console.log(csv);
    const blob = new Blob([csv.join('\r\n')], {type: 'text/csv'});
    saveAs(blob, 'myFile.csv');
  }

  mark(b: boolean | undefined): string {
    if (b) {
      return 'x';
    }
    return ' ';
  }

  saveAttendance(): void {
    const data = {
      semester: this.tmpAttendance.semester,
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

  semesterChange(): void {
    this.retrieveAttendance();
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
