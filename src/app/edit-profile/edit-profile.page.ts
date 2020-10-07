import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../api-services/api.service';
import { NavController, ToastController, AlertController } from '@ionic/angular';
import { StorageService } from '../api-services/storage.service';

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
    private storage: StorageService,
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
    this.storage.getCurrentUser().then(usr => {
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


  // Que no se eliminen las specialties del detalle de terapeuta cuando se sebreescriba
  async saveMyProfile() {
    try {
      let infoDetail = Object.assign({}, this.formProfile.value).detail
      let infoUser = Object.assign({}, this.formProfile.value)
      delete infoUser.detail
      infoUser.phone = infoUser.cel
      const updatedInfo = await this.api.updateTherapistDetail(this.user.detail.id, infoDetail)
      const updatedUsr = await this.api.updateUser(this.user.id, infoUser)
      console.log('updatedInfo', updatedInfo.data);
      console.log('updatedUsr', updatedUsr);
      this.api.setTherapistDetail(updatedInfo.data)
      this.presentToast('Perfil actualizado').then(() => this.navCtrl.back())
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
