import { Component, OnInit } from '@angular/core';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { ApiService } from '../api-services/api.service';

@Component({
  selector: 'app-my-cards',
  templateUrl: './my-cards.page.html',
  styleUrls: ['./my-cards.page.scss'],
})
export class MyCardsPage implements OnInit {
  cards: Array<any> = []

  constructor(
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private api: ApiService
  ) { }

  async ngOnInit() {
    await this.presentLoading('Cargando...')
    await this.getCards()
    this.api.getOnCardRegister().subscribe(newCard => this.getCards())
    await this.loadingCtrl.dismiss()
  }

  async getCards(event?) {
    try {
      const dataCards = await this.api.getCards()
      // console.log(dataCards);
      if (dataCards.data) {
        this.cards = dataCards.data.result.cards
        console.log('this.cards', this.cards);
        // console.log(this.paymentPending);

      }
      if (event) event.target.complete()
    } catch (error) {
      if (event) event.target.complete()
    }
  }

  async confirmDelete(card) {
    const alert = await this.alertCtrl.create({
      cssClass: 'my-custom-class',
      message: `¿Deseas eliminar esta tarjeta?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'text-primary',
          handler: () => { }
        }, {
          text: 'Aceptar',
          cssClass: 'text-secondary',
          handler: value => this.removeCard(card)
        }
      ]
    });

    await alert.present();
  }

  async removeCard(card) {
    await this.presentLoading('Eliminando...')
    // return alert('remove')
    const deleted = await this.api.removeCard(card.token)
    console.log('deleted', deleted);
    card.hidden = true
    this.loadingCtrl.dismiss().then(() => this.presentToast('Tarjeta eliminada'))
  }

  async presentLoading(message: string) {
    const loading = await this.loadingCtrl.create({
      cssClass: 'custom-loading',
      message
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
