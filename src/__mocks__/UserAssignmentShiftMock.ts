import { UserMock } from './UserMock';
import { ShiftTimeMock } from './ShiftTimeMock';

export class UserAssignmentShiftMock {
  private userAssignmentShift: any;

  constructor() {
    this.userAssignmentShift = {
      id: '1',
      user: new UserMock().build(),
      absent: false,
      coveredShiftPortion: 1,
      status: 'OPEN',
      working: true,
      chargeRate: 10,
      overtimeRate: 15,
      date: '2021-01-01',
      shiftTime: new ShiftTimeMock().build(),
      unscheduled: false
    };
  }

  build() {
    return this.userAssignmentShift;
  }

  withUser(user: any) {
    this.userAssignmentShift.user = user;
    return this;
  }

  withId(id: string) {
    this.userAssignmentShift.id = id;
    return this;
  }

  withAbsent(absent: boolean) {
    this.userAssignmentShift.absent = absent;
    return this;
  }

  withUserId(id: string) {
    this.userAssignmentShift.user.id = id;
    return this;
  }
}
