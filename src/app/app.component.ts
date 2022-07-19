import {Component, OnInit} from '@angular/core';
import {TokenStorageService} from './services/token-storage.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  isLoggedIn = false;
  isAdmin = false;

  username?: string;

  constructor(private tokenStorageService: TokenStorageService) {
  }

  ngOnInit(): void {
    this.isLoggedIn = !!this.tokenStorageService.getToken();

    if (this.isLoggedIn) {
      console.log(this.tokenStorageService.getUser());
      const user = this.tokenStorageService.getUser();
      this.username = user.username;
      this.isAdmin = user.roles.includes('ROLE_ADMIN');
    }
  }

  logout(): void {
    this.tokenStorageService.signOut();
    window.location.reload();
  }
}
