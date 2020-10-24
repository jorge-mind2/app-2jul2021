import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ApiService } from 'src/app/api-services/api.service';

@Component({
  selector: 'app-view-profile',
  templateUrl: './view-profile.component.html',
  styleUrls: ['./view-profile.component.scss'],
})
export class ViewProfileComponent implements OnInit {
  @Input('id') id: number
  profile: any
  photoProfile: string = ''
  constructor(
    private api: ApiService,
    private modalCtrl: ModalController
  ) { }

  async ngOnInit() {
    this.profile = await this.api.getProfile(this.id)
    this.photoProfile = await this.api.getPhotoProfile(this.profile)

    console.log(this.profile);

  }

  async dismiss() {
    this.modalCtrl.dismiss()
  }

}
