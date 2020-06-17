import { Component, OnInit } from '@angular/core';

import { appConstants } from '../constants.local'

import { AlertController, LoadingController, NavController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../api-services/api.service';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.page.html',
  styleUrls: ['./checkout.page.scss'],
})
export class CheckoutPage implements OnInit {
  months: any[] = appConstants.MONTHS
  years: any[]
  protected plan_id: number
  protected plan: any = {}
  view: string = 'card'
  cards: Array<any> = []
  selectedCard: any = {}
  constructor(
    private activatedRoute: ActivatedRoute,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private navCtrl: NavController,
    private currencyPipe: CurrencyPipe,
    private api: ApiService
  ) {
    this.activatedRoute.queryParams.subscribe(params => this.plan_id = +params.plan)
  }

  async ngOnInit() {
    const getPlans = await this.api.getPackages()
    const plans = getPlans.data
    this.plan = plans.find(plan => this.plan_id == plan.id)
    const dataCards = await this.api.getCards()
    console.log(dataCards);
    if (dataCards.data) {
      this.cards = dataCards.data.result.cards
      console.log('this.cards', this.cards);

      this.selectThisCard(this.cards[0])
    }
  }

  private setView(e) {
    this.view = e.detail.value
  }

  selectThisCard(selectedCard) {
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

  private async payPlan() {
    await this.presentPaymentLoading()
    try {
      const paymentData = {
        token: this.selectedCard.token,
        type: 1,
        ip: "127.0.0.0",
        packageId: this.plan.id
      }
      const postPayment = await this.api.payPlan(paymentData)
      console.log(postPayment)
      this.loadingCtrl.dismiss().finally(() => {
        this.presentSuccessAlert('Tu pago ha sido exitoso, ahora ya pudes agendar tus citas.').finally(() => this.navCtrl.navigateRoot('/home'))
      })
    } catch (error) {
      console.log(error);
      this.loadingCtrl.dismiss().finally(() => this.presentErrorAlert(error))

    }

  }

  private async presentPaymentAlert() {
    const alert = await this.alertCtrl.create({
      header: 'Pagar ahora',
      message: `Se hará el cargo de ${this.currencyPipe.transform(this.plan.amount)}MXN a tu tarjeta con terminación ${this.selectedCard.number}. ¿Deseas continuar?`,
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

  async presentSuccessAlert(message) {
    const alert = await this.alertCtrl.create({
      header: '¡Pago hecho!',
      message,
      backdropDismiss: false,
      buttons: [{
        text: 'Aceptar',
        cssClass: 'secondary'
      }]
    });

    alert.present();
  }

  async presentPaymentLoading() {
    const loading = await this.loadingCtrl.create({
      cssClass: 'custom-loading',
      message: 'Procesando pago...'
    })
    await loading.present();
  }

}
