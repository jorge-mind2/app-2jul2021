import { Component, OnInit } from '@angular/core';

import { appConstants } from '../constants.local'
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AlertController, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.page.html',
  styleUrls: ['./checkout.page.scss'],
})
export class CheckoutPage implements OnInit {
  months: any[] = appConstants.MONTHS
  years: any[]
  view: string = 'card'
  cardForm: FormGroup = new FormGroup({})
  constructor(
    private fb: FormBuilder,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController
  ) {
  }

  ngOnInit() {
  }

  private setView(e) {
    console.log(e);
    this.view = e.detail.value
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

  async presentLoading() {
    const loading = await this.loadingCtrl.create({
      cssClass: 'custom-loading',
      message: 'Cargando...'
    })
    await loading.present();
  }

}
