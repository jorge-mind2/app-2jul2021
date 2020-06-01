import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AuthService } from '../api-services/auth.service';
import { ApiService } from '../api-services/api.service';

@Component({
  selector: 'app-home-therapist',
  templateUrl: './home-therapist.page.html',
  styleUrls: ['../home/home.page.scss', './home-therapist.page.scss'],
})
export class HomeTherapistPage implements OnInit {
  user: {};
  patients: []
  constructor(
    private auth: AuthService,
    private api: ApiService,
    private navCtrl: NavController
  ) { }

  ngOnInit() {
    this.getCurrrentUSer();
  }

  public goToSessionPage(type, receiverId) {
    this.navCtrl.navigateForward('chat', { queryParams: { type, receiverId } })
  }

  public getCurrrentUSer() {
    this.auth.getCurrentUser().then((user: any) => {
      console.log(user);
      this.getPacients(user.id);
      this.user = user;
    });
  }

  public async getPacients(id) {
    let patients = await this.api.getMyPacients(id);
    console.log(patients);
    this.patients = patients
  }

  public logout() {
    this.auth.logout();
    this.auth.authenticationState.unsubscribe();
    this.navCtrl.navigateRoot('welcome')
  }

}
