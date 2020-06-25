import { Component, OnInit } from '@angular/core';
import { AuthService } from '../api-services/auth.service';
import * as moment from 'moment'

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.page.html',
  styleUrls: ['./schedule.page.scss'],
})
export class SchedulePage implements OnInit {
  days: Array<any> = [
    {
      name: 'Lunes',
      schedules: [],
      canEntrySchedules: false
    },
    {
      name: 'Martes',
      schedules: [],
      canEntrySchedules: false
    },
    {
      name: 'Miércoles',
      schedules: [],
      canEntrySchedules: false
    },
    {
      name: 'Jueves',
      schedules: [],
      canEntrySchedules: false
    },
    {
      name: 'Viernes',
      schedules: [],
      canEntrySchedules: false
    },
    {
      name: 'Sábado',
      schedules: [],
      canEntrySchedules: false
    },
    {
      name: 'Domingo',
      schedules: [],
      canEntrySchedules: false
    },
  ]
  user: any
  constructor(
    private auth: AuthService
  ) { }

  ngOnInit() {
    this.auth.getCurrentUser().then(user => this.user = user)
  }
  /*
  {
    "start_time": "string",
    "end_time": "string",
    "day": "string",
    "therapists": [
      "string"
    ]
  }
  */

  onActiveDay(day: any): void {
    console.log(day);

    if (day.canEntrySchedules && day.schedules.length <= 0) {
      this.addSchedule(day)
    }
  }

  addSchedule(day: any): void {
    let newSchedule = {
      start_time: null,
      end_time: null,
      day: day.name,
      therapists: [this.user.id],
      start_time_hours: Array.from(Array(24).keys()),
      end_time_hours: Array.from(Array(24).keys()),
      valid: false
    }
    let groups = []
    day.schedules.forEach((schedule, indx) => {
      if (moment.isDate(schedule.start_time) || (typeof schedule.start_time == 'string' && schedule.start_time.length > 5)) schedule.start_time = moment(schedule.start_time).format('HH:mm')
      if (moment.isDate(schedule.end_time) || (typeof schedule.end_time == 'string' && schedule.end_time.length > 5)) schedule.end_time = moment(schedule.end_time).format('HH:mm')
      let group = []
      group[0] = +schedule.start_time.split(':')[0]
      group[1] = +schedule.end_time.split(':')[0]
      groups.push(group)
    });
    if (groups.length) {

      newSchedule.start_time_hours = []
      // newSchedule.end_time_hours = []
      newSchedule.start_time_hours = Array.from(Array(24).keys()).filter(hour => hour > groups[groups.length - 1][1])
      /* Array.from(Array(24).keys()).forEach(hour => {
        console.log('hour', hour);

        groups.forEach(group => {
          console.log('group', group)
          if (hour > group[1]) {
            // if (hour < group[0] || hour > group[1]) {
            console.log('added hour', hour);
            newSchedule.start_time_hours.push(hour)
          }
        })
      }) */
      // newSchedule.start_time = `${groups[groups.length - 1][1] + 1}:00`
      newSchedule.start_time = null
      newSchedule.end_time = null
      let last = day.schedules[day.schedules.length - 1]
      last.valid = true
    }
    day.schedules.push(newSchedule)
  }

  onSetStartTime(schedule: any): void {
    schedule.end_time = null
    if (moment.isDate(schedule.start_time) || (typeof schedule.start_time == 'string' && schedule.start_time.length > 5)) schedule.start_time = moment(schedule.start_time).format('HH:mm')
    const start_time = +schedule.start_time.split(':')[0]
    schedule.end_time_hours = Array.from(Array(24).keys()).filter(hour => hour > start_time);
  }

  removeSchedule(day: { schedules: [any] }): void {
    day.schedules.pop()
    let last = day.schedules[day.schedules.length - 1]
    last.valid = false
  }

  saveSchedule() {

  }

}
