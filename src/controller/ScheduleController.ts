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

export default class ScheduleController {
    private sections:Section[] = [];
    private rooms:Room[] = [];

    private schedule: Scheduled[];

    public makeSchedule(rooms: Room[], sections: Section[]) {
        
    }

}