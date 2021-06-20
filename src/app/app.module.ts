import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {LoginComponent} from './components/login/login.component';
import {RegisterComponent} from './components/register/register.component';
import {ProfileComponent} from './components/profile/profile.component';
import {AttendanceDetailsComponent} from './components/attendance-details/attendance-details.component';
import {AttendanceListComponent} from './components/attendance-list/attendance-list.component';
import {authInterceptorProviders} from './helpers/auth.interceptor';
import {DatePipe} from '@angular/common';
import {UsersComponent} from './components/users/users.component';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    ProfileComponent,
    AttendanceDetailsComponent,
    AttendanceListComponent,
    UsersComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule
  ],
  providers: [
    authInterceptorProviders,
    DatePipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
