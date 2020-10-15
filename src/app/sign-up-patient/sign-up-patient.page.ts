import { Component, OnInit } from '@angular/core';
import { ModalController, LoadingController, AlertController, NavController } from '@ionic/angular';
import { TermsPage } from '../terms/terms.page';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { appConstants } from "../constants.local";
import { AuthService } from '../api-services/auth.service';

@Component({
  selector: 'app-sign-up-patient',
  templateUrl: './sign-up-patient.page.html',
  styleUrls: ['../sign-up/sign-up.page.scss', './sign-up-patient.page.scss'],
})
export class SignUpPatientPage implements OnInit {
  form: FormGroup = new FormGroup({})
  countries: any[] = appConstants.COUNTRIES
  states: any[]
  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private navCtrl: NavController,
    private auth: AuthService
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      last_name: ['', Validators.required],
      age: [null, Validators.required],
      country: ['', Validators.required],
      state: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      cel: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      terms: [false, Validators.required]
    })
  }

  ngOnInit() {
  }

  public onCountrySelect(c) {
    this.form.controls.state.setValue('')
    const selected = c.value
    this.states = this.countries.find(c => c.name == selected).states
  }

  async presentModal() {
    const modal = await this.modalCtrl.create({
      component: TermsPage
    });
    return await modal.present()
  }

  public showTerms() {
    this.presentModal()
  }

  public async signUpUser() {
    await this.presentLoading()
    try {
      let data = { ...this.form.value, phone: this.form.value.cel, role: 1 }
      data.age = `${data.age}`
      let newUser = await this.auth.signupUser(data)
      console.log(newUser);
      this.loadingCtrl.dismiss()
      const alert = await this.alertCtrl.create({
        header: 'Registro con éxito',
        message: 'Verifica tu email por favor.',
        backdropDismiss: false,
        buttons: [{
          text: 'Aceptar',
          cssClass: 'secondary',
          handler: () => this.goBack()
        }]
      });

      alert.present();
    } catch (e) {
      console.log(e)
      this.loadingCtrl.dismiss()
      // this.presentErrorAlert(e.error.message[0])
    }

  }

  private goBack() {
    this.navCtrl.navigateBack('welcome')
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
    await loading.present()
  }

}
