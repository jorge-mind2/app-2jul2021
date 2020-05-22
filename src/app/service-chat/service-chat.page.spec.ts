import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceChatPage } from './service-chat.page';

describe('ServiceChatPage', () => {
  let component: ServiceChatPage;
  let fixture: ComponentFixture<ServiceChatPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServiceChatPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceChatPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
