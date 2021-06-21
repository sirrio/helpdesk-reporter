import {Component, OnInit} from '@angular/core';
import {combineAll, count, groupBy, map, merge, mergeMap, reduce, shareReplay, toArray, zipAll} from 'rxjs/operators';
import {Attendance} from '../../models/attendance.model';
import {AttendanceService} from '../../services/attendance.service';
import {UserService} from '../../services/user.service';
import {TokenStorageService} from '../../services/token-storage.service';
import {DatePipe} from '@angular/common';
import {combineLatest, forkJoin, of, pipe, zip} from 'rxjs';
import {fromArray} from 'rxjs/internal/observable/fromArray';


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

  chartData ?: { name: string | undefined; value: number }[] = [];
  view: [number, number] = [800, 600];

  // options
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = false;
  showXAxisLabel = true;
  xAxisLabel = 'Besucher';
  showYAxisLabel = false;
  yAxisLabel = 'Datum';

  colorScheme = {
    domain: ['#5AA454', '#A10A28']
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
      const tmp: { name: string | undefined; value: number; }[] | null | undefined = [];
      this.attendanceService.getAll().pipe(
        mergeMap(key => key),
        groupBy(attendance => attendance.date),
        mergeMap(group => {
          const groupcount = group.pipe(count());
          return groupcount.pipe(map(countvalue => ({name: this.getWeekday(group.key) + ' ' + this.formatDate(group.key), value: countvalue})));
        }))
        .subscribe(d => {
            tmp.push(d);
            this.chartData = tmp;
          }
        );
    }
  }

  onSelect(event: any): void {
    console.log(event);
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
