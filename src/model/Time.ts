/**
 * Created by pablo on 11/17/16.
 */

import Section from "./Section";
import Room from "./Room";

export default class Time {
    Days: string; // MTF or T/Th
    time: number; // 9 am = 9, 1:30 pm = 13.5

    constructor () {}

    public validTime(): boolean {
        if (this.Days != 'MTF' || this.Days != 'T/Th') {
            return false;
        } else if (this.time % .5 != 0) {
            return false;
        } else if (this.time >= 24 || this.time < 0) {
            return false;
        } else {
            return true;
        }
    }
}