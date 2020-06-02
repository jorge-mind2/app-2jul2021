import { Component, OnInit } from '@angular/core';

import { appConstants } from '../constants.local'
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { SR_PAGO } from "../keys";
import { AlertController, LoadingController } from '@ionic/angular';

declare var SrPago: any
declare var $: any

@Component({
  selector: 'app-add-card',
  templateUrl: './add-card.page.html',
  styleUrls: ['./add-card.page.scss'],
})
export class AddCardPage implements OnInit {
  months: any[] = appConstants.MONTHS
  years: any[]
  cardForm: FormGroup = new FormGroup({})
  constructor(
    private fb: FormBuilder,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController
  ) {
    /*
    number
    holder_name
    cvv
    exp_month
    exp_yea
    */
    this.cardForm = this.fb.group({
      number: [null, [Validators.required, Validators.minLength(16), Validators.maxLength(16)]],
      holder_name: ['', [Validators.required]],
      cvv: [null, [Validators.required]],
      exp_month: [null, [Validators.required]],
      exp_year: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(4)]]
    })
    SrPago.setLiveMode(false);
    console.log($);

    SrPago.setPublishableKey(SR_PAGO.APIKEY)
  }

  ngOnInit() {
    this.getYears()
  }

  getYears() {
    const currentYear = new Date().getFullYear()
    this.years = Array(12).fill(null).map((v, i) => i + currentYear)
  }

  private async addCard() {
    console.log(this.cardForm);
    console.log(SrPago);
    await this.presentLoading();
    SrPago.token.create(this.cardForm.value, e => {
      console.log(e);
      this.loadingCtrl.dismiss();
    }, async error => {
      this.loadingCtrl.dismiss();
      console.log(error);
      await this.presentErrorAlert(error.message);
    });
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
