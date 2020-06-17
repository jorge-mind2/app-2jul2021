import { Component, OnInit } from '@angular/core';

import { appConstants } from '../constants.local'
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { SR_PAGO } from "../keys";
import { AlertController, LoadingController, ToastController, NavController } from '@ionic/angular';
import { AuthService } from '../api-services/auth.service';
import { ApiService } from '../api-services/api.service';

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
  private cardForm: FormGroup = new FormGroup({})
  private card: any = {
    token: '',
    metadata: {
    }
  }
  user: any
  constructor(
    private fb: FormBuilder,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private navCtrl: NavController,
    private auth: AuthService,
    private api: ApiService
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
      exp_year: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(4)]],
      "billing": this.fb.group({
        billingEmailAddress: ['', Validators.required],
        billingFirstName_D: ['', Validators.required],
        billingMiddleName_D: ['', Validators.required],
        billingLastName_D: ['', Validators.required],
        billingAddress_D: ['', Validators.required],
        billingAddress2_D: ['', Validators.required],
        billingCity_D: ['', Validators.required],
        billingState_D: ['', Validators.required],
        billingPostalCode_D: ['', Validators.required],
        billingCountry_D: ['', Validators.required],
        billingPhoneNumber_D: ['', Validators.required]
      })
    })
    SrPago.setLiveMode(false)
    SrPago.setPublishableKey(SR_PAGO.APIKEY)
    this.auth.getCurrentUser().then(usr => {
      this.user = usr
      this.cardForm.patchValue({
        billing: {
          billingEmailAddress: this.user.email,
          billingFirstName_D: this.user.name,
          billingLastName_D: this.user.last_name,
          billingCountry_D: this.user.country,
          billingPhoneNumber_D: this.user.phone,
          billingState_D: this.user.state,
          billingCity_D: this.user.state
        }
      })
    })
  }

  ngOnInit() {
    this.getYears()
  }

  getYears() {
    const currentYear = new Date().getFullYear()
    this.years = Array(20).fill(null).map((v, i) => i + currentYear)
  }

  private async addCard() {
    try {
      // if (this.cardForm.invalid) return this.presentErrorAlert('Por favor llena todos los campos correctamente')
      console.log(this.cardForm);
      console.log(SrPago)
      await this.presentLoading();
      const onlyCard = {
        number: this.cardForm.controls.number.value,
        holder_name: this.cardForm.controls.holder_name.value,
        cvv: this.cardForm.controls.cvv.value,
        exp_month: this.cardForm.controls.exp_month.value,
        exp_year: this.cardForm.controls.exp_year.value,
      }
      SrPago.token.create(onlyCard, e => {
        console.log(e);
        this.saveCard(e.token)
      }, async error => {
        throw error.message
      });
    } catch (error) {
      this.loadingCtrl.dismiss();
      await this.presentErrorAlert(error.message);
      console.log(error);

    }
  }

  private async saveCard(token: string) {
    try {
      this.card.token = token
      this.card.metadata.billing = this.cardForm.controls.billing.value
      const newCard = await this.api.createCard(this.card)
      console.log(newCard);
      this.loadingCtrl.dismiss();
      this.presentToast('Tarjeta agregada').then(() => this.navCtrl.back())
    } catch (error) {
      this.loadingCtrl.dismiss();
    }
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

  async presentToast(text) {
    const toast = await this.toastCtrl.create({
      message: text,
      duration: 3000,
      position: 'top'
    });
    toast.present();
  }

}
