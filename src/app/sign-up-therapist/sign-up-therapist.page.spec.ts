import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SignUpTherapistPage } from './sign-up-therapist.page';

describe('SignUpTherapistPage', () => {
  let component: SignUpTherapistPage;
  let fixture: ComponentFixture<SignUpTherapistPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SignUpTherapistPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SignUpTherapistPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
