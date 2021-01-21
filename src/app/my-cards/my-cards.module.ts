import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { MyCardsPage } from './my-cards.page';
import { CommonPagesModule } from '../common/common-pages.module';

const routes: Routes = [
  {
    path: '',
    component: MyCardsPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    CommonPagesModule
  ],
  declarations: [MyCardsPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MyCardsPageModule { }
