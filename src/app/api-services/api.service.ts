import { Injectable } from '@angular/core';
import { HTTP } from '@ionic-native/http/ngx';
import { HttpClient, HttpParams } from "@angular/common/http";
import { AuthService } from "./auth.service";

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private caller: any

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

  public async getPatientTherapist(type, id) {
    if (type = !'patient' || type != 'therapist') {
      return false
    }
    let opts = { params: null }
    if (type == 'patient') {
      opts.params = new HttpParams({ fromString: `join=therapist` })
      let user = this.caller.get(`/users/${id}`, opts).toPromise()
      return user.therapist
    }
  }

  public setTherapistDetail(detail: any): void {
    this.auth.getCurrentUser().then(async user => {
      user.detail = detail
      this.auth.setCurrentUser(user)
    })
  }

  public async getTherapistProfile(id) {
    const opts = { params: new HttpParams({ fromString: "join=detail&join=detail.specialties" }) }
    return await this.caller.get(`/users/${id}`, opts).toPromise()
  }

  public async getMyPacients(id) {
    const opts = { params: new HttpParams({ fromString: "join=patients" }) };
    const userWhitPatient = await this.caller.get(`/users/${id}`, opts).toPromise()
    return userWhitPatient.data.patients;
  }

  public async getMyTherapist(id) {
    const opts = { params: new HttpParams({ fromString: "join=therapist" }) };
    const userWhitPatient = await this.caller.get(`/users/${id}`, opts).toPromise()
    return userWhitPatient.data ? userWhitPatient.data.therapist : null;
  }

  public async createAppointment(appointment) {
    return await this.caller.post('/appointments', appointment).toPromise()
  }

  public async updateUser(userId: number, data: {}): Promise<any> {
    return await this.caller.patch(`/users/${userId}`, data).toPromise()
  }

  public async updateTherapistDetail(detailId: number, data: {}): Promise<any> {
    return await this.caller.patch(`/therapist-detail/${detailId}`, data).toPromise()
  }

  public async getPackages(): Promise<any> {
    return await this.caller.get('/package').toPromise()
  }

  public async createCard(card: any): Promise<any> {
    return await this.caller.post('/users/addCard', card).toPromise()
  }

  public async getCards(): Promise<any> {
    return this.caller.get('/users/cards').toPromise()
  }

  public async payPlan(paymentData: {}): Promise<any> {
    return await this.caller.post('/payments', paymentData).toPromise()
  }

}
