import { Component, OnInit } from '@angular/core';
import * as moment from 'moment'
import { ApiService } from '../api-services/api.service';
import { ToastController, NavController } from '@ionic/angular';
import { isArray, isUndefined } from 'util';
import { StorageService } from '../api-services/storage.service';

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
    private toastCtrl: ToastController,
    private navCtrl: NavController,
    private storage: StorageService,
    private api: ApiService
  ) { }

  async ngOnInit() {
    await this.storage.getCurrentUser().then(async user => {
      this.user = user
      const userSchedules = await this.api.getUserSchedules(user.id)
      console.log(userSchedules.data);
      const grouped = await this._groupBy(userSchedules.data, 'day')
      console.log({ grouped });
      for (const day of this.days) {
        day.schedules = isArray(grouped[day.name])
          ? grouped[day.name].map(schedule => {
            schedule.start_time = schedule.start_time.substring(0, 5)
            schedule.end_time = schedule.end_time.substring(0, 5)
            return schedule
          })
          : []
        if (!isUndefined(grouped[day.name])) day.canEntrySchedules = grouped[day.name]
      }
      console.log(this.days)


    })
  }

  private async _groupBy(xs: any[], key: string): Promise<[] | {}> {
    xs = xs || []
    return await xs.reduce(function (rv, x) {
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
    }, {});
  };
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
    const start_time = +schedule.start_time.split(':')[0]
    const end_time = schedule.end_time ? +schedule.end_time.split(':')[0] : null
    if (!schedule.start_time || start_time >= end_time) schedule.end_time = null
    console.log(schedule.start_time);

    if (moment.isDate(schedule.start_time) || (typeof schedule.start_time == 'string' && schedule.start_time.length > 5)) schedule.start_time = moment(schedule.start_time).format('HH:mm')
    schedule.end_time_hours = Array.from(Array(24).keys()).filter(hour => hour > start_time);
  }

  onSetEndTime(schedule: any): void {
    console.log(schedule.end_time);
    if (moment.isDate(schedule.end_time) || (typeof schedule.end_time == 'string' && schedule.end_time.length > 5)) schedule.end_time = moment(schedule.end_time).format('HH:mm')
  }

  removeSchedule(day: { schedules: [any] }): void {
    day.schedules.pop()
    let last = day.schedules[day.schedules.length - 1]
    last.valid = false
  }

  async saveSchedule() {
    try {
      const newSchedules = this.days.filter(day => day.canEntrySchedules).map(day => day.schedules).reduce((acc, val) => acc.concat(val), []).filter(schedule => schedule.start_time && schedule.end_time)
      // return console.log(newSchedules);
      // const createdSchedules = await this.api.createManySchedules(newSchedules)
      let createdSchedules = []
      let updatedSchedules = []
      for (const newSchedule of newSchedules) {
        if (newSchedule.id) {
          delete newSchedule.therapists
          const updatedSchedule = await this.api.updateSchedule(newSchedule.id, newSchedule)
          console.log({ updatedSchedule });
          updatedSchedules.push(updatedSchedule)
        } else {
          let createdSchedule = await this.api.createSchedule(newSchedule);
          console.log({ createdSchedule });
          createdSchedules.push(createdSchedule)
        }
      }
      console.log(updatedSchedules);

      console.log(createdSchedules);
      // if (createdSchedules.length==newSchedules.length)
      this.presentToast('Listo, horarios actualizados').then(() => this.navCtrl.back())

    } catch (error) {
      console.log({ error });

    }

  }

  async presentToast(text) {
    const toast = await this.toastCtrl.create({
      message: text,
      duration: 3000,
      position: 'top'
    });
    toast.present();
  }

}
