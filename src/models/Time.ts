export class Time {
  private hours: number;
  private minutes: number;
  private seconds: number;

  constructor(hours = 0, minutes = 0, seconds = 0) {
    this.hours = hours;
    this.minutes = minutes;
    this.seconds = seconds;
  }

  addMinutes(minutes: number) {
    this.minutes += minutes;
    if (this.minutes >= 60) {
      this.hours += Math.floor(this.minutes / 60);
      this.minutes = this.minutes % 60;
    }
    return this;
  }

  toString() {
    return [this.hours, this.minutes, this.seconds]
      .map(value => value.toString().padStart(2, '0'))
      .join(':');
  }
}
