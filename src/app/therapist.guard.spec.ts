import { TestBed, async, inject } from '@angular/core/testing';

import { TherapistGuard } from './therapist.guard';

describe('TherapistGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TherapistGuard]
    });
  });

  it('should ...', inject([TherapistGuard], (guard: TherapistGuard) => {
    expect(guard).toBeTruthy();
  }));
});
