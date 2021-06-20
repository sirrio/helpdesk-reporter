import {Component, OnInit} from '@angular/core';
import {AttendanceService} from '../../services/attendance.service';
import {UserService} from '../../services/user.service';
import {TokenStorageService} from '../../services/token-storage.service';
import {User} from 'src/app/models/user.model';
import {Role} from '../../models/role.model';


@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  user?: User[];
  isAdmin = false;
  isMod = false;
  isLoggedIn = false;
  username?: string;
  userid?: any;
  roles: Array<Role> | undefined;

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

      this.userService.getAll().subscribe(res => {
        this.user = res;
      });
    }

  }

}
