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

  view: [number, number] = [800, 600];
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = false;
  showXAxisLabel = true;
  xAxisLabel = 'Besucher';
  showYAxisLabel = false;
  yAxisLabel = 'Datum';
  showLabels = true;
  labelTrimmed = false;
  isDoughnut = false;

  colorSchemeBar = {
    domain: ['#66A9FA',
      '#FAA929']
  };

  colorSchemePie = {
    domain: [
      '#00876c',
      '#4f9773',
      '#79a67f',
      '#9cb58f',
      '#bbc5a5',
      '#d6d6be',
      '#ece8db',
      '#e4d2b5',
      '#e0ba93',
      '#de9f76',
      '#dc8361',
      '#d96355',
      '#d43d51',
      '#645555',
      '#7e6365',
      '#997072',
      '#b47e8d',
      '#ce8da4',
      '#e79cbf',
      '#ffacdc',
      '#d993be',
      '#b57ba1',
      '#926385',
      '#714c68',
      '#52374d',
      '#352233'
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
        .subscribe(d => {
            tmpType.push(d);
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
        .subscribe(d => {
            tmpFaculty.push(d);
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
        .subscribe(d => {
            tmpDegreeCourse.push(d);
            this.pieChartDegreeCourseData = tmpDegreeCourse;
          }
        );
      const mb = this.attendanceService.getAll().pipe(
        map(res => {
          const mathBasicCount = res.filter(attendance => attendance.mathBasic === true).length;
          return {name: 'mathBasic', value: mathBasicCount};
        }));
      const ml = this.attendanceService.getAll().pipe(
        map(res => {
          const mathLowCount = res.filter(attendance => attendance.mathLow === true).length;
          return {name: 'mathLow', value: mathLowCount};
        }));
      const mh = this.attendanceService.getAll().pipe(
        map(res => {
          const mathHighCount = res.filter(attendance => attendance.mathHigh === true).length;
          return {name: 'mathHigh', value: mathHighCount};
        }));
      const prog = this.attendanceService.getAll().pipe(
        map(res => {
          const programmingCount = res.filter(attendance => attendance.programming === true).length;
          return {name: 'programming', value: programmingCount};
        }));
      const ph = this.attendanceService.getAll().pipe(
        map(res => {
          const physicsCount = res.filter(attendance => attendance.physics === true).length;
          return {name: 'physics', value: physicsCount};
        }));
      const chem = this.attendanceService.getAll().pipe(
        map(res => {
          const chemistryCount = res.filter(attendance => attendance.chemistry === true).length;
          return {name: 'chemistry', value: chemistryCount};
        }));
      const org = this.attendanceService.getAll().pipe(
        map(res => {
          const organizationalCount = res.filter(attendance => attendance.organizational === true).length;
          return {name: 'organizational', value: organizationalCount};
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
