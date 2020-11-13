import { Injectable } from '@angular/core';
import { Headers } from "@angular/http";

import { JwtHelperService } from '@auth0/angular-jwt';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { StorageService } from './storage.service';
import { LoadingController } from '@ionic/angular';

const TOKEN_KEY = 'accessToken'

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private headers
  public token: string
  public userType: string
  authenticationState = new BehaviorSubject(null)
  loading
  constructor(
    private storage: StorageService,
    private http: HttpClient,
    private helper: JwtHelperService,
    private loadingCtrl: LoadingController
  ) { }

  async checkToken() {
    const token = await this.storage.service.get(TOKEN_KEY)
    if (token) {
      // let decoded = this.helper.decodeToken(token);
      let isExpired = this.helper.isTokenExpired(token);
      // console.log('token expired', isExpired);

      if (!isExpired) {
        // console.log('Token', token);
        /* const currentUser = await this.getServerCurrentUser()
        console.log('currentUser', currentUser); */

        const userType = await this.storage.service.get('userType')
        this.token = token;
        this.userType = userType;
        this.authenticationState.next(true);

      } else {
        this.logout();
      }
    }
  }

  public setAuthHeader(token) {
    this.headers = new Headers()
    this.headers.append('Authorization', `Bearer ${token}`)
  }

  public getAuthHeader() {
    return this.headers;
  }

  public getToken() {
    return this.token;
  }

  public async setToken(accessToken) {
    await this.storage.service.set(TOKEN_KEY, accessToken);
    return this.token = accessToken;
  }

  public async isValidToken() {
    const token = await this.storage.service.get(TOKEN_KEY)
    return this.helper.isTokenExpired(token)
  }

  public async getServerCurrentUser(): Promise<any> {
    return await this.http.get('/me').toPromise()
  }

  public async signupUser(user) {
    return await this.http.post(`/auth/signup`, user).toPromise()
  }

  public async getCurrentId(): Promise<number> {
    const user = await this.storage.getCurrentUser()
    return +user.id;
  }

  public async setCurrenUserPhoto(photo: string): Promise<void> {
    const user = await this.storage.getCurrentUser()
    user.photo = photo
    return await this.storage.setCurrentUser(user)
  }

  public isAuthenticated(): boolean {
    return this.authenticationState.value;
  }

  public async loginUser(data) {
    const newSession = await this.http.post<any>(`/auth/signin`, data).toPromise()
    console.log('login response', newSession);

    const loggedUser = newSession.data
    await this.storage.setCurrentUser(loggedUser.user)
    await this.setToken(loggedUser.accessToken)
    this.authenticationState.next(true);
    return loggedUser
  }

  public async logout(next: boolean = true) {
    const loading = await this.loadingCtrl.create({
      cssClass: 'custom-loading',
      message: 'Cerrando sesión...'
    })
    await loading.present();
    this.storage.service.remove(TOKEN_KEY).then(async () => {
      await this.storage.deleteUserStorage()
      this.userType = ''
      await loading.dismiss()
      this.authenticationState.next(false);
    });
  }

}
