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

    private schedule: Scheduled[];

    private roomIsFree(room: Room, time: Time): boolean {
        for (let s in this.schedule) {
            if (this.schedule[s].Room == room && this.schedule[s].time == time) {
                return false;
            }
        }
        return true;
    }

    private findTime(section: Section, possibleRooms: Room[], time: Time): Scheduled {
        var timeslot = new Scheduled();
        let flag: boolean = false;

        for (let r in possibleRooms) {
            if (this.roomIsFree(possibleRooms[r], time)) {

                timeslot.time = time;
                timeslot.Room = possibleRooms[r];
                timeslot.Section = section;

                return timeslot;
            }
        }

        return this.findTime(section, this.rooms, time.getNext());
    }

    private getRooms(size: number, rooms: Room[]): Room[] {
        // get all rooms large enough for a section, but not too large (2*size)
        let array: Room[] = [];
        for (let r in rooms) {
            if (rooms[r].Seats >= size) {
                if (rooms[r].Seats < 2*size) {
                    array.push(rooms[r]);
                }
            }
        }

        // sort array smallet to largest so a section chooses the smallest available classroom
        array.sort(function (obj1, obj2) {
            return obj1.Seats - obj2.Seats;
        });

        return array;
    }

    public makeSchedule(rooms: Room[], sections: Section[]): Scheduled[] {
        for (let i in sections) {
            let scheduledRoom = new Scheduled();
            let time = new Time('MWF', 8);

            let possibleRooms = this.getRooms(sections[i].Enrolled, rooms);

            var timeslot = this.findTime(sections[i], possibleRooms, time);

            this.schedule.push(timeslot);
        }
        return this.schedule;
    }

}