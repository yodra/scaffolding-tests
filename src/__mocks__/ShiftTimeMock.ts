import { Time } from '../models/Time';

export class ShiftTimeMock {
  private shiftTime: any;

  constructor() {
    this.shiftTime = {
      startTime: '08:00:00',
      endTime: '16:00:00',
      breakTimes: [
        {
          startTime: '12:00:00',
          endTime: '12:30:00',
          durationMinutes: 30
        }
      ]
    };
  }

  build() {
    return this.shiftTime;
  }

  withNBreakTimes(numberOfBreakTimes: number, durationMinutes = 30) {
    this.shiftTime.breakTimes = [];
    const startTime = new Time(8);
    for (let i = 0; i < numberOfBreakTimes; i++) {
      this.shiftTime.breakTimes.push({
        startTime: startTime.toString(),
        endTime: startTime.addMinutes(durationMinutes).toString(),
        durationMinutes
      });
    }
    return this;
  }
}
