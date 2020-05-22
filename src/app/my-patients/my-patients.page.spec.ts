import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyPatientsPage } from './my-patients.page';

describe('MyPatientsPage', () => {
  let component: MyPatientsPage;
  let fixture: ComponentFixture<MyPatientsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyPatientsPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyPatientsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
