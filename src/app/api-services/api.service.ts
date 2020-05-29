import { Injectable } from '@angular/core';
import { HTTP } from '@ionic-native/http/ngx';
import { HttpClient } from "@angular/common/http";
import { AuthService } from "./auth.service";

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  caller;

  constructor(
    private http: HTTP,
    private a_http: HttpClient,
    private auth: AuthService
  ) {
    this.http.setHeader('*', 'Access-Control-Allow-Origin', '*')
    this.http.setHeader('*', 'Content-Type', 'Application/json')
    this.caller = this.a_http;
  }

  public async loginUser(data) {
    let loggedUser = await this.caller.post(`/auth/signin`, data, {
      'Content-Type': 'Application/json'
    }).toPromise()
    await this.auth.setAuthHeader(loggedUser.accessToken)
    return loggedUser
  }

  public async signupUser(user) {
    return await this.caller.post(`/auth/signup`, user, {
      'Content-Type': 'Application/json'
    }).toPromise()
  }

  public async getSpecilaities() {
    return await this.caller.get(`/specialty`).toPromise()
  }
}
