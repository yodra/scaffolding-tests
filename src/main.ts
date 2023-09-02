import { calculateMetrics, Metrics } from './calculateMetrics';
import moment from 'moment/moment';

const usersAssignmentShifts = [
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
    },
    absent: false,
    coveredShiftPortion: 1,
    status: 'OPEN',
    working: true,
    chargeRate: 10,
    overtimeRate: 15,
    date: '2021-01-01',
    shiftTime: {
      startTime: '08:00:00',
      endTime: '16:00:00',
      breakTimes: [
        {
          startTime: '12:00:00',
          endTime: '12:30:00',
          durationMinutes: 30
        }
      ]
    },
    unscheduled: false
  },
  {
    id: '2',
    user: {
      id: '2',
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
    },
    absent: false,
    coveredShiftPortion: 1,
    status: 'OPEN',
    working: true,
    chargeRate: 10,
    overtimeRate: 15,
    date: '2021-01-01',
    shiftTime: {
      startTime: '08:00:00',
      endTime: '16:00:00',
      breakTimes: [
        {
          startTime: '12:00:00',
          endTime: '12:30:00',
          durationMinutes: 30
        }
      ]
    },
    unscheduled: false
  }
];

const output: Metrics = calculateMetrics(usersAssignmentShifts, moment());
console.log(output);
