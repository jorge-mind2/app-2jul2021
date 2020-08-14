import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './api-services/auth.service';
import { AlertController, NavController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private auth: AuthService,
    private navCtrl: NavController,
    private alertCtrl: AlertController
  ) {

  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    // this.auth.checkToken()
    return true;
  }

  async presentAlert(message: string): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Sin sesión',
      message,
      keyboardClose: false,
      backdropDismiss: false,
      buttons: [{
        text: 'Aceptar',
      }],
    })
    return alert.present();
  }
}
