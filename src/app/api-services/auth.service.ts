import { Injectable, OnInit } from '@angular/core';
import { Headers } from "@angular/http";

import { Storage } from '@ionic/storage';
import { JwtHelperService } from '@auth0/angular-jwt';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Platform } from '@ionic/angular';
import { CometChat } from '@cometchat-pro/cordova-ionic-chat';

const TOKEN_KEY = 'accessToken';

@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnInit {
  private headers
  public token: string
  public userType: string
  authenticationState
  constructor(
    private storage: Storage,
    private http: HttpClient,
    private platform: Platform,
    private helper: JwtHelperService
  ) {
    this.authenticationState = new BehaviorSubject(false)
    this.platform.ready().then(() => {
      this.checkToken();
    })
  }

  ngOnInit() {

  }

  checkToken() {
    this.storage.get(TOKEN_KEY).then(token => {
      if (token) {
        // let decoded = this.helper.decodeToken(token);
        let isExpired = this.helper.isTokenExpired(token);
        console.log('token expired', isExpired);

        if (!isExpired) {
          console.log('Token', token);
          this.storage.get('userType').then(async userType => {
            this.token = token;
            this.userType = userType;
            this.authenticationState.next(true);
          })
        } else {
          this.logout();
        }
      }
    });
  }

  public setAuthHeader(token) {
    this.headers = new Headers()
    this.headers.append('Authorization', `Bearer ${token}`)
  }

  public getAuthHeader() {
    return this.headers;
  }

  public getToken(): string {
    return this.token;
  }

  public setToken(accessToken) {
    this.storage.set(TOKEN_KEY, accessToken);
    return this.token = accessToken;
  }

  public setUserType(userType) {
    this.storage.set('userType', userType);
    return this.userType = userType;
  }

  public getUserType() {
    return this.userType;
  }

  public setCurrentUser(user) {
    this.setUserType(user.role.name)
    return this.storage.set('currentUser', user);
  }

  public async getCurrentUser() {
    return await this.storage.get('currentUser');
  }

  public isAuthenticated(): boolean {
    return this.authenticationState.value;
  }

  public async loginUser(data) {
    const newSession = await this.http.post<any>(`/auth/signin`, data).toPromise()
    const loggedUser = newSession.data
    this.setCurrentUser(loggedUser.user)
    this.setToken(loggedUser.accessToken)
    this.authenticationState.next(true);
    return loggedUser
  }

  public logout() {
    this.storage.clear().then(async () => {
      let ccuser = await CometChat.getLoggedinUser()
      if (ccuser) CometChat.logout()
      this.userType = 'logged'
      this.authenticationState.next(false);
    });
  }

}
