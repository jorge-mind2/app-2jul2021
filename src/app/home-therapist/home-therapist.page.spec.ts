import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeTherapistPage } from './home-therapist.page';

describe('HomeTherapistPage', () => {
  let component: HomeTherapistPage;
  let fixture: ComponentFixture<HomeTherapistPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HomeTherapistPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeTherapistPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
