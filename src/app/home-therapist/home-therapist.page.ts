import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AuthService } from '../api-services/auth.service';
import { ApiService } from '../api-services/api.service';
import { NavigationExtras } from '@angular/router';

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

  public goToSessionPage(type, receiverId, patient) {
    const navigationExtras: NavigationExtras = {
      queryParams: {
        type,
        receiverId
      },
      state: {
        therapist: this.user,
        patient
      }
    };
    this.navCtrl.navigateForward('chat', { ...navigationExtras })
  }

  public getCurrrentUSer() {
    this.auth.getCurrentUser().then((user: any) => {
      console.log('Mind2 user logged', user);
      if (!user) return this.auth.logout()
      this.getPacients(user.id);
      this.user = user;
    });
  }

  public async getPacients(id) {
    const patients = await this.api.getMyPacients(id);
    console.log(patients);
    this.patients = patients
  }

}
