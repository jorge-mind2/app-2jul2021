import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, LoadingController, ToastController, NavController } from '@ionic/angular';
import { ApiService } from '../api-services/api.service';
import { environment } from "../../environments/environment";
import { StorageService } from '../api-services/storage.service';
import { appConstants } from '../constants.local'
import { CardIO } from '@ionic-native/card-io/ngx';
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
  card: any = {
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
    private storage: StorageService,
    private api: ApiService,
    private cardIO: CardIO
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
      exp_year: [null, [Validators.required, Validators.minLength(2), Validators.maxLength(4)]],
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
    const isProd = environment.production
    // console.log('isProd', isProd);
    SrPago.setLiveMode(isProd)
    SrPago.setPublishableKey(environment.SR_PAGO_PUBLIC_KEY)
    this.storage.getCurrentUser().then(usr => {
      // console.log('user', usr);
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
    this.cardForm.markAsTouched()
    this.cardForm.get('number').markAsTouched()
    this.cardForm.get('holder_name').markAsTouched()
    this.cardForm.get('cvv').markAsTouched()
    this.cardForm.get('exp_month').markAsTouched()
    this.cardForm.get('exp_year').markAsTouched()
    this.cardForm.get('billing.billingEmailAddress').markAsTouched()
    this.cardForm.get('billing.billingFirstName_D').markAsTouched()
    this.cardForm.get('billing.billingMiddleName_D').markAsTouched()
    this.cardForm.get('billing.billingLastName_D').markAsTouched()
    this.cardForm.get('billing.billingAddress_D').markAsTouched()
    this.cardForm.get('billing.billingAddress2_D').markAsTouched()
    this.cardForm.get('billing.billingCity_D').markAsTouched()
    this.cardForm.get('billing.billingState_D').markAsTouched()
    this.cardForm.get('billing.billingPostalCode_D').markAsTouched()
    this.cardForm.get('billing.billingCountry_D').markAsTouched()
    this.cardForm.get('billing.billingPhoneNumber_D').markAsTouched()

  }

  scanCard() {
    this.cardIO.canScan()
      .then(
        async (res: boolean) => {
          if (res) {
            let options = {
              requireExpiry: true,
              requireCVV: true,
              requirePostalCode: false,
              keepApplicationTheme: true,
              hideCardIOLogo: true,
              guideColor: '#FFEB3B',
            };
            let { cardNumber, cvv, expiryMonth, expiryYear } = await this.cardIO.scan(options);
            /* console.log('cardNumber', cardNumber);
            console.log('cvv', cvv);
            console.log('expiryMonth', expiryMonth);
            console.log('expiryYear', expiryYear); */

            this.cardForm.patchValue({
              number: cardNumber,
              cvv: cvv,
              exp_month: `${expiryMonth}`.padStart(2, '0'),
              exp_year: `${expiryYear}`.slice(2, 4)
            })

          }
        }
      );
  }

  getYears() {
    const currentYear = new Date().getFullYear()
    this.years = Array(20).fill(null).map((v, i) => ({ value: `${i + currentYear}`.slice(2, 4), label: i + currentYear }))
  }

  public async addCard() {
    try {
      // if (this.cardForm.invalid) return this.presentErrorAlert('Por favor llena todos los campos correctamente')
      await this.presentLoading();
      let holder_name = this.removeAccents(this.cardForm.get('holder_name').value)
      const onlyCard = {
        number: this.cardForm.get('number').value,
        holder_name: holder_name,
        cvv: this.cardForm.get('cvv').value,
        exp_month: this.cardForm.get('exp_month').value,
        exp_year: this.cardForm.get('exp_year').value,
      }

      return SrPago.token.create(onlyCard, e => {
        // return console.log(e);
        return this.saveCard(e.token)
      }, async error => {
        console.log('Error token create', error);
        await this.loadingCtrl.dismiss();
        if (error.message == 'cvv') return await this.presentErrorAlert('CVV inválido.');
        if (error.message == 'cardholder_name') return await this.presentErrorAlert('Falta nombre de Tarjetahabiente.');
        await this.presentErrorAlert(error.message);
      });
    } catch (error) {
      await this.loadingCtrl.dismiss();
      await this.presentErrorAlert(error.message);
      console.log(error);
      console.log(error.code);


    }
  }

  private async saveCard(token: string) {
    try {
      this.card.token = token
      this.card.metadata.billing = this.cardForm.controls.billing.value
      // console.log('this.card', this.card);
      const newCard = await this.api.createCard(this.card)
      // console.log('newCard', newCard);
      await this.loadingCtrl.dismiss();
      this.api.setCardRegister(true)
      this.presentToast('Tarjeta agregada').then(() => this.navCtrl.back())
    } catch (error) {
      await this.loadingCtrl.dismiss();
      await this.presentErrorAlert(error.message ? error.message : JSON.stringify(error))
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
      message: 'Guardando...'
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
  private removeAccents(string) {
    const accents =
      "ÀÁÂÃÄÅàáâãäåßÒÓÔÕÕÖØòóôõöøÈÉÊËèéêëðÇçÐÌÍÎÏìíîïÙÚÛÜùúûüÑñŠšŸÿýŽž";
    const accentsOut =
      "AAAAAAaaaaaaBOOOOOOOooooooEEEEeeeeeCcDIIIIiiiiUUUUuuuuNnSsYyyZz";
    return string
      .split("")
      .map((letter, index) => {
        const accentIndex = accents.indexOf(letter);
        return accentIndex !== -1 ? accentsOut[accentIndex] : letter;
      })
      .join("");
  }

}