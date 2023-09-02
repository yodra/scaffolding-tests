import moment from 'moment';
import { calculateMetrics } from '../calculateMetrics';
import { UserMock } from '../__mocks__/UserMock';
import { UserAssignmentShiftMock } from '../__mocks__/UserAssignmentShiftMock';

class Setup {
  private usersAssignmentShifts: any;
  private metricDate: moment.Moment;

  constructor() {
    this.usersAssignmentShifts = [
      new UserAssignmentShiftMock()
        .withId('1')
        .build(),
      new UserAssignmentShiftMock()
        .withId('2')
        .withUserId('2')
        .build()
    ];

    this.metricDate = moment('2023-09-07T23:00:00.000Z');
  }

  build() {
    return this;
  }

  doCalculateMetrics() {
    return calculateMetrics(this.usersAssignmentShifts, this.metricDate);
  }

  withEmptyUserAssignmentShifts() {
    this.usersAssignmentShifts = [];
    return this;
  }

  withNullUserAssignmentShifts() {
    this.usersAssignmentShifts = null;
    return this;
  }

  withUserAbsentAs(value: boolean, assignmentShiftPosition = 0) {
    this.usersAssignmentShifts[assignmentShiftPosition].absent = value;
    return this;
  }

  appendUserWithId0() {
    const user = new UserMock().withIdZero().build();
    const shift = new UserAssignmentShiftMock().withUser(user).build();
    this.usersAssignmentShifts.push(shift);
    return this;
  }
}
