import { Component } from '@angular/core';
import { LoadingController, NavController, ToastController } from '@ionic/angular';
import { ApiService } from '../api-services/api.service';

@Component({
  selector: 'app-password-recovery',
  templateUrl: './password-recovery.page.html',
  styleUrls: ['./password-recovery.page.scss'],
})
export class PasswordRecoveryPage {

  email: string
  constructor(
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private navCtrl: NavController,
    private api: ApiService,
  ) { }

  public async recoveryPassword() {
    console.log(this.email);
    const loading = await this.loadingCtrl.create({
      cssClass: 'custom-loading',
      message: 'Espere...'
    })
    await loading.present()
    return this.api.requestRecoveryPassword(this.email).then(response => {
      console.log('Respose requestRecoveryPassword', response);
      return this.navCtrl.navigateRoot('welcome').finally(async () => {
        const toast = await this.toastCtrl.create({
          message: 'Por favor verifique su correo',
          duration: 5000,
          position: 'top'
        })
        await loading.dismiss()
        await toast.present()
      })
    }).catch(async () => {
      await loading.dismiss()
    })
  }

}
