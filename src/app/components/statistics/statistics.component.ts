import {Component, OnInit} from '@angular/core';
import {count, groupBy, map, mergeMap} from 'rxjs/operators';
import {Attendance} from '../../models/attendance.model';
import {AttendanceService} from '../../services/attendance.service';
import {UserService} from '../../services/user.service';
import {TokenStorageService} from '../../services/token-storage.service';
import {DatePipe} from '@angular/common';
import {forkJoin} from 'rxjs';


@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css']
})
export class StatisticsComponent implements OnInit {

  private roles: string[] = [];
  attendancesByDate?: Attendance[][];
  isAdmin = false;
  isMod = false;
  isLoggedIn = false;
  username?: string;
  userid?: any;

  dailyChartData ?: { name: string | undefined; value: number }[] = [];
  pieChartTypeData: { name: string | undefined; value: number }[] = [];
  pieChartFacultyData: { name: string | undefined; value: number }[] = [];
  pieChartDegreeCourseData: { name: string | undefined; value: number }[] = [];
  pieChartTutorData: { name: string | undefined; value: number }[] = [];

  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = false;
  showXAxisLabel = true;
  xAxisLabel = 'Besucher';
  showYAxisLabel = false;
  yAxisLabel = 'Datum';
  showLabels = true;

  colorSchemeBar = {
    domain: [
      '#a93226',
      '#2980b9',
    ]
  };

  colorSchemePie = {
    domain: [
      '#a93226',
      '#2980b9',
      '#e74c3c',
      '#3498db',
      '#9b59b6',
      '#1abc9c',
      '#a569bd',
      '#16a085',
      '#f1c40f',
      '#d35400',
      '#d0d3d4',
      '#2e4053',
    ]
  };


  constructor(
    private attendanceService: AttendanceService,
    private userService: UserService,
    private tokenStorageService: TokenStorageService,
    public datepipe: DatePipe) {
  }

  ngOnInit(): void {
    this.attendancesByDate = [];

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
    if (this.isAdmin) {
      const tmpType: { name: string | undefined; value: number; }[] | null | undefined = [];
      this.attendanceService.getAll().pipe(
        mergeMap(key => key),
        groupBy(attendance => attendance.date),
        mergeMap(group => {
          const groupcount = group.pipe(count());
          return groupcount.pipe(map(countvalue =>
            ({name: this.getWeekday(group.key) + ' ' + this.formatDate(group.key), value: countvalue})));
        }))
        .subscribe(data => {
            tmpType.push(data);
            this.dailyChartData = tmpType;
          }
        );
      const tmpFaculty: { name: string | undefined; value: number; }[] | null | undefined = [];
      this.attendanceService.getAll().pipe(
        mergeMap(key => key),
        groupBy(attendance => attendance.faculty),
        mergeMap(group => {
          const groupcount = group.pipe(count());
          return groupcount.pipe(map(countvalue =>
            ({name: group.key, value: countvalue})));
        }))
        .subscribe(data => {
            tmpFaculty.push(data);
            this.pieChartFacultyData = tmpFaculty;
          }
        );
      const tmpDegreeCourse: { name: string | undefined; value: number; }[] | null | undefined = [];
      this.attendanceService.getAll().pipe(
        mergeMap(key => key),
        groupBy(attendance => attendance.degreeCourse),
        mergeMap(group => {
          const groupcount = group.pipe(count());
          return groupcount.pipe(map(countvalue =>
            ({name: group.key, value: countvalue})));
        }))
        .subscribe(data => {
            tmpDegreeCourse.push(data);
            this.pieChartDegreeCourseData = tmpDegreeCourse;
          }
        );
      const tmpTutor: { name: string | undefined; value: number; }[] | null | undefined = [];
      this.attendanceService.getAll().pipe(
        mergeMap(key => key),
        groupBy(attendance => attendance.tutor.username),
        mergeMap(group => {
          const groupcount = group.pipe(count());
          return groupcount.pipe(map(countvalue =>
            ({name: group.key, value: countvalue})));
        }))
        .subscribe(data => {
            tmpTutor.push(data);
            this.pieChartTutorData = tmpTutor;
          }
        );
      const mb = this.attendanceService.getAll().pipe(
        map(res => {
          const mathBasicCount = res.filter(attendance => attendance.mathBasic === true).length;
          return {name: 'Mathe Schulwissen', value: mathBasicCount};
        }));
      const ml = this.attendanceService.getAll().pipe(
        map(res => {
          const mathLowCount = res.filter(attendance => attendance.mathLow === true).length;
          return {name: 'Mathe 1 u. 2 Sem', value: mathLowCount};
        }));
      const mh = this.attendanceService.getAll().pipe(
        map(res => {
          const mathHighCount = res.filter(attendance => attendance.mathHigh === true).length;
          return {name: 'Mathe 3+ Sem', value: mathHighCount};
        }));
      const prog = this.attendanceService.getAll().pipe(
        map(res => {
          const programmingCount = res.filter(attendance => attendance.programming === true).length;
          return {name: 'Programmierung', value: programmingCount};
        }));
      const ph = this.attendanceService.getAll().pipe(
        map(res => {
          const physicsCount = res.filter(attendance => attendance.physics === true).length;
          return {name: 'Physic', value: physicsCount};
        }));
      const chem = this.attendanceService.getAll().pipe(
        map(res => {
          const chemistryCount = res.filter(attendance => attendance.chemistry === true).length;
          return {name: 'Chemie', value: chemistryCount};
        }));
      const org = this.attendanceService.getAll().pipe(
        map(res => {
          const organizationalCount = res.filter(attendance => attendance.organizational === true).length;
          return {name: 'Organisatorisches', value: organizationalCount};
        }));
      forkJoin([mb, ml, mh, prog, ph, chem, org]).subscribe(data => {
          console.log(data);
          this.pieChartTypeData = data;
        }
      );
    }
  }

  formatDate(input?: string): string {
    const [yy, mm, dd] = input?.split('-') || [];
    return `${dd}.${mm}.${yy}`;
  }

  getWeekday(input?: string): string {
    const wd = new Date(input || '1970-01-01');
    switch (wd.getDay()) {
      case 0:
        return 'So';
      case 1:
        return 'Mo';
      case 2:
        return 'Di';
      case 3:
        return 'Mi';
      case 4:
        return 'Do';
      case 5:
        return 'Fr';
      default:
        return 'Sa';
    }
  }
}
