import { Component, Input, OnInit } from '@angular/core';
import { LoadingController, ModalController, ToastController } from '@ionic/angular';
import { ApiService } from 'src/app/api-services/api.service';

@Component({
  selector: 'app-add-coupon',
  templateUrl: './add-coupon.component.html',
  styleUrls: ['./add-coupon.component.scss'],
})
export class AddCouponComponent implements OnInit {
  @Input() packageId: number
  code: string
  constructor(
    private modalCtrl: ModalController,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private api: ApiService,
  ) { }

  ngOnInit() { }


  public async closeModal(updated: boolean = false, data?: any) {
    this.modalCtrl.dismiss({
      ...data,
      updated
    }).finally(async () => {
      if (await this.loadingCtrl.getTop()) await this.loadingCtrl.dismiss()
    });
  }

  public async validateCoupon() {
    await this.presentLoading('Validando...')
    try {
      const postCoupon = await this.api.validateCoupon({ code: this.code, packageId: this.packageId })
      console.log('postCoupon', postCoupon);
      const newData = postCoupon.data
      this.closeModal(true, newData).then(() => this.presentToast('Descuento agregado'))
    } catch (error) {
      if (await this.loadingCtrl.getTop()) await this.loadingCtrl.dismiss()
    }
  }

  async presentLoading(message: string = 'Guardando...') {
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
