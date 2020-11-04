import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(
    private http: HttpClient,
    private storage: StorageService
  ) {
  }

  public async getSpecilaities(): Promise<any> {
    return await this.http.get(`/specialty`).toPromise()
  }

  public setTherapistDetail(detail: any): void {
    this.storage.getCurrentUser().then(async user => {
      user.detail = detail
      this.storage.setCurrentUser(user)
    })
  }

  public async getTherapistProfile(id): Promise<any> {
    const opts = { params: new HttpParams({ fromString: "join=detail&join=detail.specialties" }) }
    return await this.http.get(`/users/${id}`, opts).toPromise()
  }

  public async getMyPatients(id): Promise<any> {
    const { data } = await this.http.get<any>(`/users/my-patients`).toPromise()
    return data.patients;
  }

  public async getMyTherapist(): Promise<any> {
    const { data } = await this.http.get<any>(`/users/my-therapist`).toPromise()
    return data.therapist;
  }

  public async createAppointment(appointment: any): Promise<any> {
    return await this.http.post('/appointments', appointment).toPromise()
  }

  public async updateUser(userId: number, data: {}): Promise<any> {
    return await this.http.patch(`/users/${userId}`, data).toPromise()
  }

  public async updateTherapistDetail(detailId: number, data: {}): Promise<any> {
    return await this.http.patch(`/therapist-detail/${detailId}`, data).toPromise()
  }

  public async getPackages(): Promise<any> {
    return await this.http.get('/package').toPromise()
  }

  public async createCard(card: any): Promise<any> {
    return await this.http.post('/users/addCard', card).toPromise()
  }

  public async getCards(): Promise<any> {
    return this.http.get('/users/cards').toPromise()
  }

  public async payPlan(paymentData: {}): Promise<any> {
    return await this.http.post('/payments', paymentData).toPromise()
  }

  public async createManySchedules(schedules: any[]): Promise<any> {
    return await this.http.post('/schedules/bulk', schedules).toPromise()
  }

  public async updateSchedule(scheduleId: number, schedule: any): Promise<any> {
    return await this.http.patch(`/schedules/${scheduleId}`, schedule).toPromise()
  }

  public async createSchedule(schedule: any): Promise<any> {
    return await this.http.post('/schedules', schedule).toPromise()
  }

  public async getUserSchedules(user_id: number): Promise<any> {
    let params: HttpParams = new HttpParams()
      .set('join', 'therapists')
      .set('filter', `therapists.id||$eq||${user_id}`)
    return await this.http.get('/schedules', { params }).toPromise()
  }

  public async getSupport(): Promise<any> {
    let params: HttpParams = new HttpParams()
      .set('join', 'role')
      .set('filter', `role.name||$eq||support`)
    return await this.http.get('/users', { params }).toPromise()
  }

  public async uploadUserPhoto(id: number, photo: any): Promise<any> {
    return await this.http.post(`/users/${id}/photo`, photo).toPromise()
  }

  public getBaseURL(): string {
    return environment.API_BASE_URL;
  }

  public getPhotoProfile(user: any): string {
    return user.photo ? `${this.getBaseURL()}/users/photo/${user.photo}` : `https://avatar.oxro.io/avatar.svg?size=128&background=006675&color=fff&name=${user.name.substring(0, 1)}+${user.last_name.substring(0, 1)}`
  }

  public async setUserSessionPrice(id: number, price: string): Promise<any> {
    return await this.http.post(`/users/${id}/price`, { price }).toPromise()
  }

  public async getUserAppointments(id: number): Promise<any> {
    return await this.http.get(`/users/${id}/appointments`).toPromise()
  }

  public async getPackasAvailability(): Promise<any> {
    return await this.http.get('/users/packages-availability').toPromise()
  }

  public async getTwilioToken(): Promise<any> {
    return await this.http.get('/users/twilio-token').toPromise()
  }

  public async sendChatMessagePush(message, type) {
    return await this.http.post(`/users/${type}/send-chat-message`, message).toPromise()
  }

  public async callTo(receiverId: number) {
    return await this.http.post('/users/call-to-user', { receiverId }).toPromise()
  }

  public async cancelCall(receiverId: number) {
    return await this.http.post(`/users/cancel-call/${receiverId}`, {}).toPromise()
  }

  public async sendEndCall(receiverId: number) {
    return await this.http.post(`/users/end-call/${receiverId}`, {}).toPromise()
  }

  public async sendRejectCall(callerId: number) {
    return await this.http.post(`/users/reject-call/${callerId}`, {}).toPromise()
  }

  public async sendAcceptCall(callerId: number) {
    return await this.http.post(`/users/accept-call/${callerId}`, {}).toPromise()
  }

  public async subscribeToChannel(channel: string) {
    return await this.http.get(`/users/channel-subscribe/${channel}`).toPromise()
  }

  public async getProfile(id: number) {
    const { data } = await this.http.get<any>(`/users/${id}/profile`).toPromise()
    return data.profile
  }

  public async checkSessionTime() {
    return await this.http.get('/users/check-session-time').toPromise()
  }
}
