import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api-services/api.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController, AlertController, ModalController, LoadingController } from '@ionic/angular';
import { appConstants } from '../constants.local';
import { TermsPage } from '../terms/terms.page';
import * as moment from "moment";
import { AuthService } from '../api-services/auth.service';

@Component({
  selector: 'app-sign-up-therapist',
  templateUrl: './sign-up-therapist.page.html',
  styleUrls: ['../sign-up/sign-up.page.scss', './sign-up-therapist.page.scss'],
})
export class SignUpTherapistPage implements OnInit {
  years: any = Array.from(Array(51).keys())
  form: FormGroup = new FormGroup({})
  specialties: [Object]
  countries: any[] = appConstants.COUNTRIES
  states: any[]
  constructor(
    private fb: FormBuilder,
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController,
    private loadingCtrl: LoadingController,
    private api: ApiService,
    private auth: AuthService
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      cel: ['', Validators.required],
      country: ['', Validators.required],
      state: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      terms: [false, Validators.required],
      detail: this.fb.group({
        professional_id: ['', Validators.required],
        birthdate: [null, Validators.required],
        therapy_years: [null, Validators.required],
        supervising_years: [null, Validators.required],
        address: ['', Validators.required],
        zipcode: ['', Validators.required],
        specialties: [[], [Validators.required]]
      })
    })
    /**  birthdate:string;

  @Column({type:'int'})
  therapy_years:number

  @Column({ type: 'int' })
  supervising_years: number*/
  }

  async ngOnInit() {
    const getSpecilaities = await this.api.getSpecilaities()
    this.specialties = getSpecilaities.data
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
      let data = { ...this.form.value, phone: this.form.value.cel, role: 2 }
      data.age = `${moment().diff(moment(data.detail.birthdate), 'years')}`
      data.detail.birthdate = moment(data.detail.birthdate).format('YYYY-MM-DD')
      let newUser = await this.auth.signupUser(data)
      // console.log(newUser);
      this.loadingCtrl.dismiss()
      const alert = await this.alertCtrl.create({
        header: 'Registro hecho',
        message: 'En breve te contactaremos para validar algunos datos.',
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

  selectIonDate() {
    let bd = this.form.value.detail.birthdate
    /* console.log({ bd });
    console.log(moment(bd));
    console.log(moment().diff(moment(bd), 'years')); */

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
