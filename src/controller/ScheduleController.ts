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
import Scheduled from "../model/Scheduled";
import Time from "../model/Time";

export default class ScheduleController {
    private allSections:Section[] = [];

    // This is all possible rooms
    private rooms:Room[] = [];
    // This is all rooms still available at this time slot
    private currentRooms: Room[] = [];

    private clock: Number = 8;

    private schedule: Scheduled[] = [];

    private roomIsFree(room: Room, time: Time): boolean {
        // console.log('Z - in roomIsFree(), room: ' + room.name + ', time: ' + time.time + ' ' + time.days);

        if (this.schedule.length == 0) {
            return true;
        }
        for (let s in this.schedule) {
            // console.log('Z - in roomisFree() loop, room: ' + this.schedule[s].Room.name + ', time: ' + this.schedule[s].time.time);
            if (this.schedule[s].Room.name == room.name && this.schedule[s].time.days == time.days && this.schedule[s].time.time == time.time) {
                return false;
            }
        }
        return true;
    }

    private findTime(section: Section, possibleRooms: Room[], time: Time): Scheduled {
        let that = this;
        // console.log('Z - in findTime()...');
        var timeslot = new Scheduled();

        for (let r in possibleRooms) {
            // console.log('Z - in findTime(), is room free? ' + this.roomIsFree(possibleRooms[r], time));
            if (this.roomIsFree(possibleRooms[r], time)) {

                timeslot.time = time;
                timeslot.Room = possibleRooms[r];
                timeslot.Section = section;
                return timeslot;
            }
        }

        let newTime = time.getNext();
        return that.findTime(section, possibleRooms, newTime);
    }

    // get all rooms large enough for a section, but not too large (3*size)
    private getRooms(size: number, rooms: any): Room[] {
        let array: Room[] = [];

        for (let r in rooms) {
            if (rooms[r].rooms_seats >= size) {
                if (rooms[r].rooms_seats < 3*size) {
                    array.push(rooms[r]);
                    console.log('Adding to rooms[] ' + rooms[r].rooms_seats);
                }
            }
        }

        // sort array smallest to largest so a section chooses the smallest available classroom
        array.sort(function (obj1, obj2) {
            return obj1.Seats - obj2.Seats;
        });
        console.log('Z - Section size ' + size);
        console.log('       getRooms() array: ' + array.length);
        return array;
    }

    public makeSchedule(rooms: any, sections: any): Scheduled[] {
        for (let i in sections) {
            let time = new Time('MWF', 8);

            let possibleRooms = this.getRooms(sections[i].courses_size, rooms);
            if (possibleRooms.length == 0) {
                if (this.isBigEnough(rooms, sections[i].courses_size)) {
                    possibleRooms = rooms;
                } else {
                    console.log('No room big enough');
                    throw 'No room big enough';
                }
            }

            console.log('Possible rooms = ' + possibleRooms.length);

            var timeslot = this.findTime(sections[i], possibleRooms, time);

            this.schedule.push(timeslot);
        }
        return this.schedule;
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