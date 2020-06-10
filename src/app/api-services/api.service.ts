import { Injectable } from '@angular/core';
import { HTTP } from '@ionic-native/http/ngx';
import { HttpClient, HttpParams } from "@angular/common/http";
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

  public async signupUser(user) {
    return await this.caller.post(`/auth/signup`, user, {
      'Content-Type': 'Application/json'
    }).toPromise()
  }

  public async getSpecilaities() {
    return await this.caller.get(`/specialty`).toPromise()
  }

  public async getTherapistProfile(id) {
    const opts = { params: new HttpParams({ fromString: "join=detail&join=detail.specialties" }) }
    return await this.caller.get(`/users/${id}`, opts).toPromise()
  }

  public async getMyPacients(id) {
    const opts = { params: new HttpParams({ fromString: "join=patients" }) };
    let userWhitPatient = await this.caller.get(`/users/${id}`, opts).toPromise()
    return userWhitPatient.patients;
  }

  public async getMyTherapist(id) {
    const opts = { params: new HttpParams({ fromString: "join=therapist" }) };
    let userWhitPatient = await this.caller.get(`/users/${id}`, opts).toPromise()
    return userWhitPatient.therapist;
  }

}
