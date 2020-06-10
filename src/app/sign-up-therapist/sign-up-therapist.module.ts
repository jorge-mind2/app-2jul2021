import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { SignUpTherapistPage } from './sign-up-therapist.page';
import { TermsPage } from '../terms/terms.page';
import { TermsPageModule } from '../terms/terms.module';

const routes: Routes = [
  {
    path: '',
    component: SignUpTherapistPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    TermsPageModule
  ],
  entryComponents: [TermsPage],
  declarations: [SignUpTherapistPage]
})
export class SignUpTherapistPageModule { }
