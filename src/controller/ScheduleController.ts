/**
 * Created by pablo on 11/17/16.
 */

import Log from '../Util';
import JSZip = require('jszip');
import Section from '../model/Section';
import fs = require('fs');
import {stringify} from "querystring";
import {error} from "util";
import parse5 = require('parse5');
import forEach = require("core-js/fn/array/for-each");
import Room from "../model/Room";
import Time from "../model/Time";
import Scheduled from "../model/Scheduled";

export default class ScheduleController {

    private schedule: Scheduled[] = [];

    private scheduleIsFree(array: any, room: any, time: Time): boolean {
        for(var i=0;i<array.length;i++) {
            console.log(array[i].Room);
            if (array[i].Room.rooms_name == room.rooms_name && array[i].time.time === time.time && array[i].time.days === time.days) {
                return false;
            }
        }
        return true;
    }

    private roomIsFree(room: any, time: Time): boolean {
        let that = this;
        // console.log('Z - in roomIsFree(), room: ' + room.name + ', time: ' + time.time + ' ' + time.days);

        if (this.schedule.length == 0) {
            return true;
        } else {
            return this.scheduleIsFree(that.schedule, room, time);
        }
    }

    private findTime(section: any, possibleRooms: any, time: Time): Scheduled {
        let that = this;
        // console.log(section);   // section has courses_intructor, _size and _title

        for (let r of possibleRooms) {
            console.log('Z - is room free? time, room');
            console.log(time);
            console.log(r);
            let flag = false;

            if (that.schedule.length == 0) {

                console.log('Schedule empty, added 1st timeslot');

                let timeslot = new Scheduled();
                timeslot.time = time;
                timeslot.Room = r;
                timeslot.Section = section;
                that.schedule.push(timeslot);
                return timeslot;

            } else {
                // schedule not empty, so check each entry
                for(let slot of that.schedule) {
                    let s: any;
                    s = slot;
                    console.log('Schedule not empty, slot ' + s.time.time + ' ' + s.time.days + ' ' + s.Room.rooms_name);
                    console.log('Compare to        , slot ' + time.time + ' ' + time.days + ' ' + r.rooms_name);
                    console.log('Same time? ' + (slot.time.time === time.time && slot.time.days === time.days));
                    console.log('Same building? ' + (s.Room.rooms_shortname === r.rooms_shortname));
                    console.log('Same room? ' + (s.Room.rooms_shortname === r.rooms_shortname));

                    if (slot.time.time === time.time && slot.time.days === time.days) {
                        if (s.Room.rooms_shortname === r.rooms_shortname && s.Room.rooms_shortname === r.rooms_shortname) {
                            // room occupied
                            flag = true;
                            break;
                        } else if (s.Section.courses_instructor == section.courses_instructor) {
                            flag = true;
                            break;
                        } else {
                            // room not occupied
                            flag = false;
                        }
                    } else {
                        // room not occupied
                        flag = false;
                    }
                }
                if (!flag) {
                    console.log('Found room:')
                    console.log()
                    let timeslot = new Scheduled();
                    timeslot.time = time;
                    timeslot.Room = r;
                    timeslot.Section = section;
                    that.schedule.push(timeslot);
                    return timeslot;
                } else {

                }
            }
        }
        let newTime = time.getNext();

        console.log('No rooms, next slot:');
        console.log(newTime);

        return that.findTime(section, possibleRooms, newTime);
    }

    // get all rooms large enough for a section, but not too large (3*size)
    private getRooms(size: number, rooms: any): Room[] {
        let array: Room[] = [];

        for (let r in rooms) {
            if (rooms[r].rooms_seats >= size) {
                if (rooms[r].rooms_seats < 3*size) {
                    array.push(rooms[r]);
                }
            }
        }

        // sort array smallest to largest so a section chooses the smallest available classroom
        array.sort(function (obj1, obj2) {
            return obj1.Seats - obj2.Seats;
        });
        // console.log('Z - Section size ' + size);
        // console.log('       getRooms() array: ' + array.length);
        return array;
    }

    public makeSchedule(rooms: any, sections: any): Scheduled[] {
        let that = this;
        for (let i in sections) {
            let time = new Time('MWF', 8);

            let possibleRooms = that.getRooms(sections[i].courses_size, rooms);
            if (possibleRooms.length == 0) {
                if (that.isBigEnough(rooms, sections[i].courses_size)) {
                    possibleRooms = rooms;
                } else {
                    console.log('No room big enough');
                    throw 'No room big enough';
                }
            }

            var timeslot = that.findTime(sections[i], possibleRooms, time);

            // console.log('Z - this.schedule.length is');
            // console.log(that.schedule.length);
        }
        console.log(that.schedule);
        return that.schedule;
    }

    public checkQuality(schedule: Scheduled[]): number {
        let counter = 0;
        for (let i in schedule) {
            if (schedule[i].time.time > 17) {
                counter++;
            }
        }
        let quality = (counter/(schedule.length-1));
        return quality;
    }

    private isBigEnough(rooms: any, size: number): boolean {
        for (let r in rooms) {
            if (rooms[r].rooms_seats >= size) {
                return true;
            }
        }
        return false;
    }

}