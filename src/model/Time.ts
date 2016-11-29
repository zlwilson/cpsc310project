/**
 * Created by pablo on 11/17/16.
 */

import Section from "./Section";
import Room from "./Room";

export default class Time {
    days: string; // MTF or T/Th
    time: number; // 9 am = 9, 1:30 pm = 13.5

    constructor (days: string, time: number) {
        this.days = days;
        this.time = time;
    }

    public validTime(): boolean {
        if (this.days != 'MTF' || this.days != 'T/Th') {
            return false;
        } else if (this.time % .5 != 0) {
            return false;
        } else if (this.time >= 24 || this.time < 0) {
            return false;
        } else {
            return true;
        }
    }

    /*
    This gets the next best timeslot.
    Once it fills all 8 am to 5 pm slots on Mon/Wed/Fri it put the rest on T/Th
    If it's possible this will only put classes between 
     */
    public getNext(): Time {
        // get the next available time slot
        if (this.days == 'MWF') {
            if (this.time < 16) {
                return new Time('MWF', this.time+1);
            } else {
                return new Time('T/Th', 8);
            }
        } else {
            return new Time('T/Th', this.time + 1.5);
        }
    }
}