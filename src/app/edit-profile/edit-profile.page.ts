import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../api-services/api.service';
import { AuthService } from '../api-services/auth.service';
import { NavController, ToastController, AlertController } from '@ionic/angular';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.page.html',
  styleUrls: ['./edit-profile.page.scss'],
})
export class EditProfilePage implements OnInit {
  user: any
  formProfile: FormGroup = new FormGroup({})
  years: Array<number> = Array.from(Array(51).keys())
  constructor(
    private navCtrl: NavController,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private fb: FormBuilder,
    private api: ApiService,
    private auth: AuthService,
  ) {
    this.formProfile = this.fb.group({
      cel: ['', Validators.required],
      detail: this.fb.group({
        address: ['', Validators.required],
        zipcode: ['', Validators.required],
        supervising_years: ['', Validators.required],
        therapy_years: ['', Validators.required],
        bio: ['']
      })
    })
  }

  ngOnInit() {
    this.auth.getCurrentUser().then(usr => {
      this.user = usr
      const detail = usr.detail
      console.log(usr.detail)
      this.formProfile.patchValue({
        cel: usr.cel,
        detail: {
          address: detail.address,
          zipcode: detail.zipcode,
          supervising_years: detail.supervising_years,
          therapy_years: detail.therapy_years,
          bio: detail.bio
        }
      });
    })
  }

  async saveMyProfile() {
    console.log({ ...this.user.detail, ...this.formProfile.value })
    try {
      const updatedUsr = await this.api.updateUser(this.user.id, this.formProfile.value)
      console.log(updatedUsr);
      const newUsrDetail = { ...this.user.detail, ...this.formProfile.value }
      console.log(newUsrDetail);
      this.presentToast('Perfil actualizado')
      this.api.setTherapistDetail(newUsrDetail)
      // this.navCtrl.back()
    } catch (error) {
      console.log(error);

    }
  }

  async presentToast(text) {
    const toast = await this.toastCtrl.create({
      message: text,
      duration: 3000,
      position: 'top'
    });
    toast.present();
  }

  async presentErrorAlert(message) {

    const alert = await this.alertCtrl.create({
      header: 'Algo salió mal',
      message,
      backdropDismiss: false,
      buttons: [{
        text: 'Aceptar',
        cssClass: 'secondary'
      }]
    });

    alert.present();
  }

}
