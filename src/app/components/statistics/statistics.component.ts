import {Component, OnInit} from '@angular/core';
import {count, groupBy, map, mergeMap, reduce, toArray} from 'rxjs/operators';
import {Attendance} from '../../models/attendance.model';
import {AttendanceService} from '../../services/attendance.service';
import {UserService} from '../../services/user.service';
import {TokenStorageService} from '../../services/token-storage.service';
import {DatePipe, formatDate} from '@angular/common';
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

  dailyChartData ?: any = [];
  pieChartTypeData: { name: string | undefined; value: number }[] = [];
  pieChartFacultyData: { name: string | undefined; value: number }[] = [];
  pieChartDegreeCourseData: { name: string | undefined; value: number }[] = [];
  pieChartTutorData: { name: string | undefined; value: number }[] = [];

  showXAxis = false;
  showYAxis = true;
  gradient = false;
  showLegend = true;
  showXAxisLabel = true;
  xAxisLabel = 'Besucher';
  showYAxisLabel = false;
  yAxisLabel = 'Datum';
  showLabels = true;
  noBarWhenZero = false;
  statsHeight = 800;

  semester: string[] = ['WS2122', 'SS21'];
  currentSemester = 'WS2122';

  colorSchemeBar = {
    domain: [
      '#a93226',
      '#2396e0',
      '#ffb85b',
      '#6ee141',
      '#6f6d81',
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

  getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }

  semesterChange(): void {
    this.retrieveAttendance();
  }

  retrieveAttendance(): void {
    if (this.currentSemester !== 'all') {
      if (this.isAdmin) {
        const tmpType: any = [];
        this.attendanceService.getAllBySemester(this.currentSemester)
          .pipe(
            mergeMap(key => {
              return key;
            }),
            groupBy(attendance => attendance.date),
            mergeMap(group => {
              const groupcount = group.pipe(count());
              return groupcount.pipe(map(countvalue => {
                  const d = group.key || '1.1.1990';
                  const wd = this.getWeekNumber(new Date(d));
                  return ({
                    weekday: `KW ${wd}`,
                    name: this.getWeekday(group.key),
                    value: countvalue,
                    extra: {date: this.formatDate(group.key)}
                  });
                }
              ));
            }),
            groupBy(Obj => Obj.weekday),
            mergeMap(group => group.pipe(
              reduce((acc: any, cur) => [...acc, cur], [`${group.key}`])
            )),
            map(arr => ({name: arr[0], series: arr.slice(1)}))
          ).subscribe(data => {
            tmpType.push(data);
            console.log(data);

            this.dailyChartData = tmpType;
            this.statsHeight = this.dailyChartData.length * 150;
          }
        );
        const tmpFaculty: { name: string | undefined; value: number; }[] | null | undefined = [];
        this.attendanceService.getAllBySemester(this.currentSemester)
          .pipe(
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
        this.attendanceService.getAllBySemester(this.currentSemester)
          .pipe(
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
        this.attendanceService.getAllBySemester(this.currentSemester)
          .pipe(
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
        const mb = this.attendanceService.getAllBySemester(this.currentSemester)
          .pipe(
            map(res => {
              const mathBasicCount = res.filter(attendance => attendance.mathBasic === true).length;
              return {name: 'Mathe Schulwissen', value: mathBasicCount};
            }));
        const ml = this.attendanceService.getAllBySemester(this.currentSemester)
          .pipe(
            map(res => {
              const mathLowCount = res.filter(attendance => attendance.mathLow === true).length;
              return {name: 'Mathe 1 u. 2 Sem', value: mathLowCount};
            }));
        const mh = this.attendanceService.getAllBySemester(this.currentSemester)
          .pipe(
            map(res => {
              const mathHighCount = res.filter(attendance => attendance.mathHigh === true).length;
              return {name: 'Mathe 3+ Sem', value: mathHighCount};
            }));
        const prog = this.attendanceService.getAllBySemester(this.currentSemester)
          .pipe(
            map(res => {
              const programmingCount = res.filter(attendance => attendance.programming === true).length;
              return {name: 'Programmierung', value: programmingCount};
            }));
        const ph = this.attendanceService.getAllBySemester(this.currentSemester)
          .pipe(
            map(res => {
              const physicsCount = res.filter(attendance => attendance.physics === true).length;
              return {name: 'Physic', value: physicsCount};
            }));
        const chem = this.attendanceService.getAllBySemester(this.currentSemester)
          .pipe(
            map(res => {
              const chemistryCount = res.filter(attendance => attendance.chemistry === true).length;
              return {name: 'Chemie', value: chemistryCount};
            }));
        const org = this.attendanceService.getAllBySemester(this.currentSemester)
          .pipe(
            map(res => {
              const organizationalCount = res.filter(attendance => attendance.organizational === true).length;
              return {name: 'Organisatorisches', value: organizationalCount};
            }));
        forkJoin([mb, ml, mh, prog, ph, chem, org]).subscribe(data => {
            this.pieChartTypeData = data;
          }
        );
      }
    } else {
      if (this.isAdmin) {
        const tmpType: any = [];
        this.attendanceService.getAll()
          .pipe(
            mergeMap(key => {
              return key;
            }),
            groupBy(attendance => attendance.date),
            mergeMap(group => {
              const groupcount = group.pipe(count());
              return groupcount.pipe(map(countvalue => {
                  const d = group.key || '1.1.1990';
                  const wd = this.getWeekNumber(new Date(d));
                  return ({
                    weekday: `KW ${wd}`,
                    name: this.getWeekday(group.key),
                    value: countvalue,
                    extra: {date: this.formatDate(group.key)}
                  });
                }
              ));
            }),
            groupBy(Obj => Obj.weekday),
            mergeMap(group => group.pipe(
              reduce((acc: any, cur) => [...acc, cur], [`${group.key}`])
            )),
            map(arr => ({name: arr[0], series: arr.slice(1)}))
          ).subscribe(data => {
            tmpType.push(data);
            console.log(data);

            this.dailyChartData = tmpType;
            this.statsHeight = this.dailyChartData.length * 150;
          }
        );
        const tmpFaculty: { name: string | undefined; value: number; }[] | null | undefined = [];
        this.attendanceService.getAll()
          .pipe(
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
        this.attendanceService.getAll()
          .pipe(
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
        this.attendanceService.getAll()
          .pipe(
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
        const mb = this.attendanceService.getAll()
          .pipe(
            map(res => {
              const mathBasicCount = res.filter(attendance => attendance.mathBasic === true).length;
              return {name: 'Mathe Schulwissen', value: mathBasicCount};
            }));
        const ml = this.attendanceService.getAll()
          .pipe(
            map(res => {
              const mathLowCount = res.filter(attendance => attendance.mathLow === true).length;
              return {name: 'Mathe 1 u. 2 Sem', value: mathLowCount};
            }));
        const mh = this.attendanceService.getAll()
          .pipe(
            map(res => {
              const mathHighCount = res.filter(attendance => attendance.mathHigh === true).length;
              return {name: 'Mathe 3+ Sem', value: mathHighCount};
            }));
        const prog = this.attendanceService.getAll()
          .pipe(
            map(res => {
              const programmingCount = res.filter(attendance => attendance.programming === true).length;
              return {name: 'Programmierung', value: programmingCount};
            }));
        const ph = this.attendanceService.getAll()
          .pipe(
            map(res => {
              const physicsCount = res.filter(attendance => attendance.physics === true).length;
              return {name: 'Physic', value: physicsCount};
            }));
        const chem = this.attendanceService.getAll()
          .pipe(
            map(res => {
              const chemistryCount = res.filter(attendance => attendance.chemistry === true).length;
              return {name: 'Chemie', value: chemistryCount};
            }));
        const org = this.attendanceService.getAll()
          .pipe(
            map(res => {
              const organizationalCount = res.filter(attendance => attendance.organizational === true).length;
              return {name: 'Organisatorisches', value: organizationalCount};
            }));
        forkJoin([mb, ml, mh, prog, ph, chem, org]).subscribe(data => {
            this.pieChartTypeData = data;
          }
        );
      }
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
