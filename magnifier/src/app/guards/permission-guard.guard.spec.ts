import { TestBed } from '@angular/core/testing';

import { PermissionGuard } from './permission-guard.guard';

describe('PermissionGuardGuard', () => {
  let guard: PermissionGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(PermissionGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
