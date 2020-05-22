import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CallTherapistPage } from './call-therapist.page';

describe('CallTherapistPage', () => {
  let component: CallTherapistPage;
  let fixture: ComponentFixture<CallTherapistPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CallTherapistPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CallTherapistPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
