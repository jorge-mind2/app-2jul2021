import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.page.html',
  styleUrls: ['./edit-profile.page.scss'],
})
export class EditProfilePage implements OnInit {
  formProfile: FormGroup = new FormGroup({})
  constructor(
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder
  ) {
    this.formProfile = this.fb.group({
      cel: ['', Validators.required],
      email: ['', [Validators.email, Validators.email]],
      detail: {
        address: ['', Validators.required],
        zipcode: ['', Validators.required],
        supervising_years: ['', Validators.required],
        therapy_years: ['', Validators.required],
        bio: ['']
      }
    })
    let usr = this.activatedRoute.snapshot.paramMap.getAll('user')
    console.log(usr);

  }

  ngOnInit() {
  }

}
