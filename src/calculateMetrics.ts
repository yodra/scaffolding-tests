import moment, { Moment } from 'moment/moment';

const getTimeDifferenceInMinutes = (start, end, date) => {
  if (!start || !end || !date) {
    return 0;
  }

  const format = 'YYYY-MM-DD HH:mm:ss';
  const startDateTime = moment(date + start, format);
  const endDateTime = moment(date + end, format);
  if (endDateTime.isBefore(startDateTime, 'minute')) {
    endDateTime.add(1, 'days');
  }
  return moment.duration(endDateTime.diff(startDateTime)).asMinutes();
};

export const calculateMetrics = (usersAssigmentShifts, metricDate: Moment) => {
  let scheduledTime;
  let time;
  let totalHours = 0;
  let totalCost = 0;
  let agencySpend = 0;
  let totalOvertime = 0;

  const isAssigned = (status) => ['ASSIGNED', 'APPROVED', 'DECLINED', 'IN_PROGRESS', 'UNSUBMITTED', 'SUBMITTED', 'NOT_STARTED'].includes(status);

  let usersByDay = {};
  let approvedTime;
  let totalOpenShifts = 0;
  let totalAssignedShifts = 0;
  let totalInterested = 0;
  let totalNeedsApproval = 0;
  let totalNotStarted = 0;
  let totalAbsent = 0;

  for (const currentAssignmentDay of usersAssigmentShifts) {
    const user = currentAssignmentDay.user;
    const {
      dailyOvertimeCutoverHours,
      weeklyOvertimeCutoverHours,
      payPeriodOvertimeCutoverHours
    } = user;

    let overtimeRules = {
      dailyOvertimeCutoverHours,
      weeklyOvertimeCutoverHours,
      payPeriodOvertimeCutoverHours
    };

    if (currentAssignmentDay.absent) {
      totalAbsent += currentAssignmentDay.coveredShiftPortion || 1;
    } else if ((isAssigned(currentAssignmentDay.status) ||
        currentAssignmentDay.status === 'OPEN' ||
        currentAssignmentDay.status === 'INTERESTED') &&
      currentAssignmentDay.working) {
      if (user.id === 0) {
        totalOpenShifts += currentAssignmentDay.coveredShiftPortion || 1;
      } else {
        if (currentAssignmentDay.status === 'INTERESTED') {
          totalInterested += currentAssignmentDay.coveredShiftPortion || 1;
          totalOpenShifts += currentAssignmentDay.coveredShiftPortion || 1;
        }
        if (currentAssignmentDay.status !== 'INTERESTED') {
          totalAssignedShifts += currentAssignmentDay.coveredShiftPortion || 1;
        }
        if (currentAssignmentDay.status === 'SUBMITTED') {
          totalNeedsApproval += currentAssignmentDay.coveredShiftPortion || 1;
        }
      }
      let rates = {
        rate: currentAssignmentDay.chargeRate || 0,
        overtimeRate: currentAssignmentDay.overtimeRate || 0
      };
      let currentAssignmentDayDate;
      let startBreakTime;
      let endBreakTime;
      approvedTime = 0.0;
      currentAssignmentDayDate = moment(currentAssignmentDay.date);
      let startTime = currentAssignmentDay.shiftTime?.startTime;
      let endTime = currentAssignmentDay.shiftTime?.endTime;
      let scheduledStartTime = currentAssignmentDay.startTime;
      let scheduledEndTime = currentAssignmentDay.endTime;

      if (currentAssignmentDay.status === 'NOT_STARTED') {
        totalNotStarted++;
      }

      let breakMinutes = 0;
      if (endTime && currentAssignmentDay.shiftTime.breakTimes) {
        for (let breakTime of currentAssignmentDay.shiftTime?.breakTimes) {
          if (breakTime.startTime && !breakTime.endTime) {
            breakMinutes = 0;
            break;
          } else if (breakTime.durationMinutes && breakTime.durationMinutes > 0) {
            breakMinutes += breakTime.durationMinutes;
          } else if (breakTime.startTime && breakTime.endTime) {
            startBreakTime = moment('1970-01-01 ' + breakTime.startTime);
            endBreakTime = moment('1970-01-01 ' + breakTime.endTime);
            let duration = moment.duration(endBreakTime.diff(startBreakTime));
            breakMinutes += duration.asMinutes();
          }
        }
      }
      if (currentAssignmentDay.status !== 'DECLINED' &&
        currentAssignmentDay.status !== 'REQUESTED' &&
        !currentAssignmentDay.unscheduled) {
        time = endTime ? getTimeDifferenceInMinutes(startTime, endTime, '1970-01-01') - breakMinutes : 0;
        scheduledTime = getTimeDifferenceInMinutes(scheduledStartTime, scheduledEndTime, '1970-01-01');
        if (currentAssignmentDay.status === 'APPROVED') {
          approvedTime = time;
        }
      } else {
        time = 0;
        scheduledTime = 0;
        approvedTime = 0;
      }
      let week = currentAssignmentDayDate.week();
      let dayOfYear = currentAssignmentDayDate.dayOfYear();
      let deptUserByDay = usersByDay[user.id + '|' + dayOfYear];
      if (deptUserByDay) {
        deptUserByDay.scheduledTime = deptUserByDay.scheduledTime + scheduledTime / 60;
        deptUserByDay.time = deptUserByDay.time + time / 60;
        deptUserByDay.approvedTime = deptUserByDay.approvedTime + approvedTime / 60;
      } else {
        deptUserByDay = {
          id: user.id,
          type: user.workerType,
          overtimeRules,
          rates,
          time: time / 60,
          scheduledTime: scheduledTime / 60,
          approvedTime: approvedTime / 60,
          week,
          isWeekend:
            currentAssignmentDayDate.day() === 0 ||
            currentAssignmentDayDate.day() === 6
        };
      }
      usersByDay[user.id + '|' + dayOfYear] = deptUserByDay;
    }
  }

  let finalUsers = {};
  Object.values(usersByDay).forEach((deptUserByDay) => {
    const { time, approvedTime, scheduledTime, week, id, isWeekend, rates } = deptUserByDay as any;
    let deptUser = finalUsers[id];
    if (!deptUser) {
      const { type, overtimeRules } = deptUserByDay as any;
      deptUser = { id, type, days: [], overtimeRules };
    }
    const newRates = finalUsers[id] ? finalUsers[id].rates : {};
    if (isWeekend) {
      newRates.weekendRate = rates.rate;
      newRates.overtimeRate = rates.overtimeRate;
      newRates.weekdayRate = newRates.weekdayRate ? newRates.weekdayRate : rates.rate;
    } else {
      newRates.weekdayRate = rates.rate;
      newRates.overtimeRate = rates.overtimeRate;
      newRates.weekendRate = newRates.weekendRate ? newRates.weekendRate : rates.rate;
    }
    deptUser.rates = newRates;
    deptUser.days.push({ time, approvedTime, scheduledTime, week, isWeekend });
    finalUsers[id] = deptUser;
  });

  let totalScheduledTime;
  let totalWeekendTime;
  let totalWeekendScheduledTime;
  let totalWeekendTimes;
  let totalWeekendScheduledTimes;
  let totalWeekTimes;
  let totalWeekApprovedTimes;
  let totalWeekScheduledTimes;
  let scheduledOvertimeHours;
  let totalNonOvertimeTime;
  let totalNonOvertimeApprovedTime;
  let totalNonOvertimeScheduledTime;

  for (const user of Object.values(finalUsers)) {
    const deptUser = user as any;
    if (deptUser.id === 0) {
      continue;
    }
    const overtimeRules = deptUser.overtimeRules;
    const rates = deptUser.rates;

    totalNonOvertimeTime = 0.0;
    totalNonOvertimeApprovedTime = 0.0;
    totalNonOvertimeScheduledTime = 0.0;
    scheduledOvertimeHours = 0.0;
    totalScheduledTime = 0.0;
    totalWeekendTime = 0.0;
    totalWeekendScheduledTime = 0.0;

    totalWeekendTimes = {};
    totalWeekendScheduledTimes = {};
    totalWeekTimes = {};
    totalWeekApprovedTimes = {};
    totalWeekScheduledTimes = {};

    for (const day of deptUser.days) {
      totalScheduledTime = totalScheduledTime + day.scheduledTime;
      if (overtimeRules.dailyOvertimeCutoverHours && day.time > overtimeRules.dailyOvertimeCutoverHours) {
        day.time = overtimeRules.dailyOvertimeCutoverHours;
      }
      if (overtimeRules.dailyOvertimeCutoverHours && day.approvedTime > overtimeRules.dailyOvertimeCutoverHours) {
        day.approvedTime = overtimeRules.dailyOvertimeCutoverHours;
      }
      if (overtimeRules.dailyOvertimeCutoverHours && day.scheduledTime > overtimeRules.dailyOvertimeCutoverHours) {
        scheduledOvertimeHours += day.scheduledTime - overtimeRules.dailyOvertimeCutoverHours;
        day.scheduledTime = overtimeRules.dailyOvertimeCutoverHours;
      }

      if (day.isWeekend) {
        totalWeekendTimes[day.week] = (totalWeekendTimes[day.week] || 0.0) + day.time;
        totalWeekendScheduledTimes[day.week] = (totalWeekendScheduledTimes[day.week] || 0.0) + day.scheduledTime;
      } else {
        totalWeekendTimes[day.week] = totalWeekendTimes[day.week] || 0.0;
        totalWeekendScheduledTimes[day.week] = totalWeekendScheduledTimes[day.week] || 0.0;
      }
      totalWeekTimes[day.week] = (totalWeekTimes[day.week] || 0.0) + day.time;
      totalWeekApprovedTimes[day.week] = (totalWeekApprovedTimes[day.week] || 0.0) + day.approvedTime;
      totalWeekScheduledTimes[day.week] = (totalWeekScheduledTimes[day.week] || 0.0) + day.scheduledTime;
    }

    for (const week of Object.keys(totalWeekTimes)) {
      const weeklyTime = totalWeekTimes[week];
      const weeklyApprovedTime = totalWeekApprovedTimes[week];
      const weeklyScheduledTime = totalWeekScheduledTimes[week];

      if (!overtimeRules.weeklyOvertimeCutoverHours) {
        totalNonOvertimeTime += weeklyTime;
        totalNonOvertimeApprovedTime += weeklyApprovedTime;
        totalNonOvertimeScheduledTime += weeklyScheduledTime;
        totalWeekendTime += totalWeekendTimes[week];
        totalWeekendScheduledTime += totalWeekendScheduledTimes[week];
      } else {
        const weeklyOvertimeCutoverHours = overtimeRules.weeklyOvertimeCutoverHours;

        if (weeklyTime > weeklyOvertimeCutoverHours) {
          totalWeekendTime = totalWeekendTime + Math.max(0, totalWeekendTimes[week] - weeklyTime + weeklyOvertimeCutoverHours);
          totalNonOvertimeTime += weeklyOvertimeCutoverHours;
        } else {
          totalNonOvertimeTime += weeklyTime;
          totalWeekendTime = totalWeekendTime + totalWeekendTimes[week];
        }

        if (weeklyApprovedTime > weeklyOvertimeCutoverHours) {
          totalNonOvertimeApprovedTime += weeklyOvertimeCutoverHours;
        } else {
          totalNonOvertimeApprovedTime += weeklyApprovedTime;
        }

        if (weeklyScheduledTime > weeklyOvertimeCutoverHours) {
          totalWeekendScheduledTime += Math.max(0, totalWeekendScheduledTimes[week] - totalNonOvertimeScheduledTime + weeklyOvertimeCutoverHours);
          scheduledOvertimeHours += weeklyScheduledTime - weeklyOvertimeCutoverHours;
          totalNonOvertimeScheduledTime += weeklyOvertimeCutoverHours;
        } else {
          totalNonOvertimeScheduledTime += weeklyScheduledTime;
          totalWeekendScheduledTime += totalWeekendScheduledTimes[week];
        }
      }
    }

    const overtimeCutoff = overtimeRules.payPeriodOvertimeCutoverHours;
    if (overtimeCutoff) {
      totalNonOvertimeTime = Math.min(totalNonOvertimeTime, overtimeCutoff);
      totalNonOvertimeApprovedTime = Math.min(totalNonOvertimeApprovedTime, overtimeCutoff);
      totalNonOvertimeScheduledTime = Math.min(totalNonOvertimeScheduledTime, overtimeCutoff);

      if (totalNonOvertimeTime < overtimeCutoff) {
        totalWeekendTime = Math.max(0, totalWeekendTime - (overtimeCutoff - totalNonOvertimeTime));
        totalNonOvertimeTime = overtimeCutoff;
      }

      if (totalNonOvertimeScheduledTime < overtimeCutoff) {
        const scheduledOvertime = Math.max(0, totalNonOvertimeScheduledTime - overtimeCutoff);
        totalWeekendScheduledTime += scheduledOvertime;
        scheduledOvertimeHours += scheduledOvertime;
        totalNonOvertimeScheduledTime = overtimeCutoff;
      }
    }

    let scheduledOvertimeCost = (scheduledOvertimeHours * rates.overtimeRate) / 100;
    let scheduledCost = ((totalNonOvertimeScheduledTime - totalWeekendScheduledTime) * rates.weekdayRate) / 100 +
      (totalWeekendScheduledTime * rates.weekendRate) / 100 +
      scheduledOvertimeCost;

    totalHours += totalScheduledTime;
    totalCost += scheduledCost;
    totalOvertime += scheduledOvertimeCost;
    if (deptUser.type === 'CONTRACTOR') {
      agencySpend += scheduledCost;
    }
  }

  return {
    totalOpenShifts,
    totalNeedsApproval,
    totalNotStarted,
    totalAssignedShifts,
    totalInterested,
    totalAbsent,
    totalHours,
    totalCost,
    totalOvertime,
    agencySpend,
    metricDate
  };
};
