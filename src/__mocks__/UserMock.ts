export class UserMock {
  private user: any;

  constructor() {
    this.user = {
      id: '1',
      workerType: 'employee',
      dailyOvertimeCutoverHours: 3,
      weeklyOvertimeCutoverHours: 40,
      payPeriodOvertimeCutoverHours: 80,
      userTeams: [
        {
          id: '1',
          name: 'Team 1'
        },
        {
          id: '2',
          name: 'Team 2'
        }
      ]
    };
  }

  build() {
    return this.user;
  }

  withIdZero() {
    this.user.id = '0';
    return this;
  }

}
