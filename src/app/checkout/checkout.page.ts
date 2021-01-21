import { Component, OnInit } from '@angular/core';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { File } from '@ionic-native/file/ngx';
import { AlertController, LoadingController, ModalController, NavController, Platform } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../api-services/api.service';
import { CurrencyPipe } from '@angular/common';
import { appConstants } from '../constants.local'
import * as moment from "moment";
import { StorageService } from '../api-services/storage.service';
import { AddCouponComponent } from './add-coupon/add-coupon.component';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.page.html',
  styleUrls: ['./checkout.page.scss'],
})
export class CheckoutPage implements OnInit {
  moment = moment
  months: any[] = appConstants.MONTHS
  years: any[]
  plan_id: number
  plan: any = {}
  view: string = 'card'
  cards: Array<any> = []
  selectedCard: any = {}
  paymentPending = {
    status: null,
    expired: true,
    expiration_date: null
  }
  discount_percent: number = 0
  coupon: any = {
    id: null,
    active: false
  }
  constructor(
    private activatedRoute: ActivatedRoute,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private navCtrl: NavController,
    private modalCtrl: ModalController,
    private currencyPipe: CurrencyPipe,
    private file: File,
    private fileTransfer: FileTransfer,
    private platform: Platform,
    private storage: StorageService,
    private api: ApiService
  ) {
    this.activatedRoute.queryParams.subscribe(params => this.plan_id = +params.plan)
  }

  async ngOnInit() {
    await this.presentPaymentLoading('Cargando...')
    const user = await this.storage.getCurrentUser()
    if (user.discount_percent && +user.discount_percent > 0) this.discount_percent = +user.discount_percent
    const getPlans = await this.api.getPackages()
    const plans = getPlans.data
    this.plan = plans.find(plan => this.plan_id == plan.id)
    this.plan.final_price = this.plan.amount - (this.plan.amount * (this.discount_percent / 100))
    await this.getCards()
    this.loadingCtrl.dismiss()
    this.api.getOnCardRegister().subscribe(newCard => this.getCards())
  }

  async getCards(event?) {
    try {
      const dataCards = await this.api.getCards()
      // console.log(dataCards);
      if (dataCards.data) {
        this.cards = dataCards.data.result.cards
        console.log('this.cards', this.cards);
        if (dataCards.data.result.pending_payment && dataCards.data.result.pending_payment.status == 2) {
          this.paymentPending = dataCards.data.result.pending_payment
          this.paymentPending.expired = moment(this.paymentPending.expiration_date).isBefore(moment(), 'day')
        }
        // console.log(this.paymentPending);

        this.selectThisCard(this.cards[0])
      }
      if (event) event.target.complete()
    } catch (error) {
      if (event) event.target.complete()
    }
  }

  public setView(e) {
    this.view = e.detail.value
  }

  selectThisCard(selectedCard) {
    if (!selectedCard) return
    this.cards.forEach((card: any) => {
      if (card.number.length > 4) card.number = card.number.substr(card.number.length - 4)
      if (card.token != selectedCard.token) {
        card.color = 'dark'
        card.selected = false
      }
    })
    selectedCard.color = 'tertiary'
    selectedCard.selected = true
    this.selectedCard = selectedCard
  }

  async addCoupon() {
    const modal = await this.modalCtrl.create({
      component: AddCouponComponent,
      componentProps: {
        packageId: this.plan.id
      }
    })
    await modal.present()
    const { data } = await modal.onDidDismiss()
    if (data.updated) {
      console.log('data', data);

      this.plan.final_price = data.finalPackagePice
      this.coupon = data
      this.coupon.id = data.couponId
      this.coupon.active = true
      // console.log('this.coupon', this.coupon);

    }
  }

  async removeCoupon() {
    this.plan.final_price = this.coupon.userPackagePrice
    this.coupon = {
      active: false,
      id: null
    }
  }

  private async payPlan() {
    // console.log('this.coupon', this.coupon);

    await this.presentPaymentLoading('Procesando pago...')
    try {
      const paymentData = {
        token: this.selectedCard.token,
        type: 1,
        ip: "127.0.0.0",
        packageId: this.plan.id,
        couponId: this.coupon.id
      }
      // console.log('paymentData', paymentData);
      const postPayment = await this.api.payPlan(paymentData)
      // console.log(postPayment)
      this.loadingCtrl.dismiss().finally(() => {
        this.presentSuccessAlert('Tu pago ha sido exitoso, ahora ya pudes agendar tus citas.', '¡Pago hecho!').finally(() => this.navCtrl.navigateRoot('/home'))
      })
    } catch (error) {
      console.log(error);
      this.loadingCtrl.dismiss()
      // .finally(() => this.presentErrorAlert(error))

    }

  }

  async getPaymentTicket() {
    await this.presentPaymentLoading('Obteniendo recibo...')
    try {
      const paymentData = {
        token: null,
        type: 2,
        ip: "127.0.0.0",
        packageId: this.plan.id,
        couponId: this.coupon.id
      }
      const postPayment = await this.api.payPlan(paymentData)
      // console.log(postPayment)
      const ticketURL = postPayment.data.result.url;
      const expirationDate = moment(postPayment.data.result.expiration_date).toLocaleString();
      const amount = postPayment.data.result.total.amount;
      /*
      RESPONSE
      {
        "success": true,
        "result": {
          "transaction": "f4eb6a19-6b97-4d99-9bff-226300372fa7",
          "store": {
            "name": "OXXO",
            "short_name": "OXXO"
          },
          "type": "barcode",
          "bank_account_number": "4201000318262020080100400009",
          "bank_name": "OXXO",
          "barcode": "4201000318262020080100400009",
          "barcode_url": "https://sandbox-connect.srpago.com/barcode/f4eb6a19-6b97-4d99-9bff-226300372fa7/4201000318262020080100400009",
          "reference": {
            "description": "400-cus_dev_5f249df8696d5"
          },
          "total": {
            "amount": "400.00",
            "currency": "MXN"
          },
          "url": "https://sandbox-connect.srpago.com/voucher/YmFyY29kZV80MjAxMDAwMzE4MjYyMDIwMDgwMTAwNDAwMDA5",
          "timestamp": "2020-07-31T18:31:23-05:00",
          "expiration_date": "2020-08-01T00:00:00-05:00",
          "status": 2,
          "status_code": "pending"
        }
      }
      */
      this.paymentPending = postPayment.data.result
      // console.log('this.paymentPending', this.paymentPending);

      this.loadingCtrl.dismiss().finally(() => {
        this.presentSuccessAlert('Recibo generado exitosamente.', 'Pago Pendiente')
      })
    } catch (error) {
      console.log(error);
      this.loadingCtrl.dismiss()
      // .finally(() => this.presentErrorAlert(error))

    }

  }

  async downloadTicket(file, name) {
    const fileTransfer: FileTransferObject = this.fileTransfer.create();
    const fileName = `${name}_${new Date().getTime()}.pdf`
    if (this.platform.is('cordova')) {
      this.file.checkDir(this.file.externalRootDirectory, 'downloads')
        .then(
          // Directory exists, check for file with the same name
          _ => this.file.checkFile(this.file.externalRootDirectory, 'downloads/' + fileName)
            .then(_ => { alert("A file with the same name already exists!") })
            // File does not exist yet, we can save normally
            .catch(err =>
              fileTransfer.download(file, this.file.externalRootDirectory + '/downloads/' + fileName).then((entry) => {
                alert('File saved in:  ' + entry.nativeURL);
              })
                .catch((err) => {
                  alert('Error saving file: ' + err.message);
                })
            ))
        .catch(
          // Directory does not exists, create a new one
          err => this.file.createDir(this.file.externalRootDirectory, 'downloads', false)
            .then(response => {
              alert('New folder created:  ' + response.fullPath);
              fileTransfer.download(file, this.file.externalRootDirectory + '/downloads/' + fileName).then((entry) => {
                alert('File saved in : ' + entry.nativeURL);
              })
                .catch((err) => {
                  alert('Error saving file:  ' + err.message);
                });

            }).catch(err => {
              alert('It was not possible to create the dir "downloads". Err: ' + err.message);
            })
        );

    } else {
      // If downloaded by Web Browser
      let link = document.createElement("a");
      link.download = fileName;
      link.href = file;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      link = null;
    }
  }

  async presentPaymentAlert() {
    const alert = await this.alertCtrl.create({
      header: 'Pagar ahora',
      message: `Se hará el cargo de ${this.currencyPipe.transform(this.plan.final_price)}MXN a tu tarjeta con terminación ${this.selectedCard.number}. ¿Deseas continuar?`,
      backdropDismiss: false,
      buttons: [{
        text: 'Aceptar',
        cssClass: 'text-secondary',
        handler: () => this.payPlan()
      }, {
        text: 'Cancelar',
        cssClass: 'primary'
      }]
    })

    alert.present();
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

  async presentSuccessAlert(message, header) {
    const alert = await this.alertCtrl.create({
      header,
      message,
      backdropDismiss: false,
      buttons: [{
        text: 'Aceptar',
        cssClass: 'secondary'
      }]
    });

    alert.present();
  }

  async presentPaymentLoading(message: string) {
    const loading = await this.loadingCtrl.create({
      cssClass: 'custom-loading',
      message
    })
    await loading.present();
  }

}
