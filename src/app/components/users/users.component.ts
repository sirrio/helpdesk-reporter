import {Component, OnInit} from '@angular/core';
import {UserService} from '../../services/user.service';
import {TokenStorageService} from '../../services/token-storage.service';
import {map, mergeMap} from 'rxjs/operators';
import {Observable} from 'rxjs';


@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  users: { id: any, isMod: any; isAdmin: any; isUser: any; username: any; pw: string }[] | undefined;
  isAdmin = false;
  isMod = false;
  isLoggedIn = false;
  username?: string;
  userid?: any;
  passwordStr = '';

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

      const tmp: { id: any, isMod: any; isAdmin: any; isUser: any; username: any; pw: string }[] | null | undefined = [];
      const all = this.reload();
      all.subscribe(data => {
          tmp.push(data);
          this.users = tmp;
        }
      );
    }
  }

  reload(): Observable<{ isMod: any; pw: string; id: any; isAdmin: any; isUser: any; username: any }> {
    const tmp: { id: any, isMod: any; isAdmin: any; isUser: any; username: any; pw: string }[] | null | undefined = [];
    return this.userService.getAll().pipe(
      mergeMap(res => res),
      map(u => {
        const isAdmin = u.roles?.some(e => e.name === 'admin');
        const isMod = u.roles?.some(e => e.name === 'moderator');
        const isUser = u.roles?.some(e => e.name === 'user');
        return {id: u.id, username: u.username, isAdmin, isMod, isUser, pw: ''};
      }));
  }

  toggleRole(id: any, role: string, rm: boolean): void {
    this.userService.updateRole(id, role, rm).subscribe(() => {
      const tmp: { id: any, isMod: any; isAdmin: any; isUser: any; username: any; pw: string }[] | null | undefined = [];
      const all = this.reload();
      all.subscribe(data => {
          tmp.push(data);
          this.users = tmp;
        }
      );
    });
  }

  updatePassword(id: any, password: string): void {
    if (password.length < 6) {
      window.alert('Zu kurz');
    } else {
      this.userService.updatePassword(id, password).subscribe(() => {
        const tmp: { id: any, isMod: any; isAdmin: any; isUser: any; username: any; pw: string }[] | null | undefined = [];
        const all = this.reload();
        all.subscribe(data => {
            tmp.push(data);
            this.users = tmp;
          }
        );
      });
    }
  }
}
