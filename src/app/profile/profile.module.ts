import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ProfilePage } from './profile.page';
import { MenuComponentModule } from '../menu/menu.module';
import { Camera } from '@ionic-native/camera/ngx';
import { File } from '@ionic-native/file/ngx';

const routes: Routes = [
  {
    path: '',
    component: ProfilePage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    MenuComponentModule
  ],
  declarations: [ProfilePage],
  providers: [
    Camera,
    File
  ]
})
export class ProfilePageModule { }
