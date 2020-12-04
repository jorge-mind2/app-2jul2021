import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCouponComponent } from './add-coupon.component';

describe('AddCouponComponent', () => {
  let component: AddCouponComponent;
  let fixture: ComponentFixture<AddCouponComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddCouponComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddCouponComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
