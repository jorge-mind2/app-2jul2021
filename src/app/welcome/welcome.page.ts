import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { StorageService } from '../api-services/storage.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss'],
})
export class WelcomePage implements OnInit {

  constructor(
    private navCtrl: NavController,
    private storage: StorageService
  ) { }

  ngOnInit() {
    this.storage.getCurrentUser().then(async user => {
      if (user) {
        let userHome = user.role.name == 'therapist' ? 'home-therapist' : 'home'
        this.navCtrl.navigateRoot(userHome)
      }
    })
  }

  public gotoSignUpPage() {
    this.navCtrl.navigateForward('sign-up-patient')
  }

  public goToLoginPage(type) {
    this.navCtrl.navigateForward('/login', { queryParams: { type } })
  }

}
