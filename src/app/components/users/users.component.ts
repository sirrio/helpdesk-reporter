import {Component, OnInit} from '@angular/core';
import {AttendanceService} from '../../services/attendance.service';
import {UserService} from '../../services/user.service';
import {TokenStorageService} from '../../services/token-storage.service';
import {User} from 'src/app/models/user.model';
import {Role} from '../../models/role.model';
import {map, mergeMap} from 'rxjs/operators';
import {forkJoin} from 'rxjs';


@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  users: { isMod: any; isAdmin: any; isUser: any; username: any; }[] | undefined;
  isAdmin = false;
  isMod = false;
  isLoggedIn = false;
  username?: string;
  userid?: any;

  constructor(private userService: UserService,
              private tokenStorageService: TokenStorageService) {
  }

  ngOnInit(): void {
    this.isLoggedIn = !!this.tokenStorageService.getToken();
    if (this.isLoggedIn) {
      const user = this.tokenStorageService.getUser();
      this.username = user.username;
      this.userid = user.id;
      this.isAdmin = user.roles.includes('ROLE_ADMIN');

      const tmp: { isMod: any; isAdmin: any; isUser: any; username: any; }[] | null | undefined = [];
      const all = this.userService.getAll().pipe(
        mergeMap(res => res),
        map(u => {
          const isAdmin = u.roles?.some(e => e.name === 'admin');
          const isMod = u.roles?.some(e => e.name === 'moderator');
          const isUser = u.roles?.some(e => e.name === 'user');
          return {username: u.username, isAdmin, isMod, isUser};
        }));
      all.subscribe(data => {
          tmp.push(data);
          this.users = tmp;
          console.log(data);
        }
      );
    }
  }
}
