import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SignUpPageModule } from './sign-up.module';
import { SignUpPatientPageModule } from '../sign-up-patient/sign-up-patient.module';

const routes: Routes = [
  {
    path: '',
    component: SignUpPageModule,
    children: [
      {
        path: 'patient',
        children: [
          {
            path: '',
            loadChildren: '../sign-up-patient/sign-up-patient.module#SignUpPatientPageModule'
          }
        ]
      },
      {
        path: 'therapist',
        children: [
          {
            path: '',
            loadChildren: '../sign-up-therapist/sign-up-therapist.module#SignUpTherapistPageModule'
          }
        ]
      },
      {
        path: '',
        redirectTo: '/sign-up/therapist',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class SignUpPageRoutingModule { }
