import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CallPatientPage } from './call-patient.page';

describe('CallPatientPage', () => {
  let component: CallPatientPage;
  let fixture: ComponentFixture<CallPatientPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CallPatientPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CallPatientPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
