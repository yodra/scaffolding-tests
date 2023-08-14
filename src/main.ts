import { calculateMetrics } from './calculateMetrics';
import moment from 'moment/moment';

interface Metrics {
  agencySpend: number,
  metricDate: moment.Moment,
  totalAbsent: number,
  totalAssignedShifts: number,
  totalCost: number,
  totalHours: number,
  totalInterested: number,
  totalNeedsApproval: number,
  totalNotStarted: number,
  totalOpenShifts: number,
  totalOvertime: number;
}

const usersAssigmentShifts = [
  {
    id: '1',
    user: {
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
    }
  }
];

const output: Metrics = calculateMetrics(usersAssigmentShifts, moment());
console.log(output);
