import { Injectable } from '@angular/core';
import { Headers } from "@angular/http";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private headers
  constructor(
  ) { }

  public setAuthHeader(token) {
    this.headers = new Headers()
    this.headers.append('Authorization', `Bearer ${token}`)
  }

  public getAuthHeader() {
    return this.headers;
  }
}
