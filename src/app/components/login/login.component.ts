import {Component, OnInit} from '@angular/core';
import {AuthService} from '../../services/auth.service';
import {TokenStorageService} from '../../services/token-storage.service';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  form: any = {
    username: null,
    password: null
  };
  isLoginFailed = false;
  errorMessage = '';
  roles: string[] = [];

  constructor(
    private authService: AuthService,
    private tokenStorage: TokenStorageService,
    private route: ActivatedRoute,
    private router: Router) {
  }

  ngOnInit(): void {
    if (this.tokenStorage.getToken()) {
      this.roles = this.tokenStorage.getUser().roles;
      this.router.navigate(['/attendance']);
    }
  }

  onSubmit(): void {
    const {username, password} = this.form;

    this.authService.login(username, password).subscribe(
      data => {
        this.tokenStorage.saveToken(data.accessToken);
        this.tokenStorage.saveUser(data);

        this.isLoginFailed = false;
        this.roles = this.tokenStorage.getUser().roles;
        window.location.reload();
        this.router.navigate(['/attendance']);
      },
      err => {
        this.errorMessage = err.error.message;
        this.isLoginFailed = true;
      }
    );
  }
}
