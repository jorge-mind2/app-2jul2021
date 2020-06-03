import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-password-recovery',
  templateUrl: './password-recovery.page.html',
  styleUrls: ['./password-recovery.page.scss'],
})
export class PasswordRecoveryPage implements OnInit {

  email: string
  constructor() { }

  ngOnInit() {
  }

  private recoveryPassword() {
    console.log(this.email);

  }

}
