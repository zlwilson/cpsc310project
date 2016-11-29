import ScheduleController from "../src/controller/ScheduleController";
import Room from "../src/model/Room";
import Section from "../src/model/Section";
import Log from "../src/Util";
import {expect} from 'chai';

describe('ScheduleController', function () {

    beforeEach(function () {
    });

    afterEach(function () {
    });

    it.only('Should be able to create schedule', function () {
        Log.test('Creating room array');
        let roomArray: Room[] = [];
        let building = 'Building';
        let name = 'BLD';
        let add = '123 Main St.';
        let lat = 49;
        let lon = 41;
        let seats = 20;
        let type = 'Small';
        let furniture = 'Movable';
        let href = 'www.ubc.ca';
        let i = 1;
        while (i < 8) {
            let room = new Room();
            room.FullName = building;
            room.ShortName = name;
            room.Number = (100+i).toString();
            room.name = name.concat((100+i).toString());
            room.Address = add;
            room.latitude = lat;
            room.longitude = lon;
            room.Seats = seats*i;
            room.Type = type;
            room.Furniture = furniture;
            room.href = href;
            roomArray.push(room);
            i++;
        }
        
        Log.test('Creating section array');
        let sectionArray: Section[] = [];
        let title = 'new course';
        let prof = 'Teacher';
        let audit = 0;
        let withdrew = 2;
        let year = 2014;
        let stddev = 5.2;
        let high = 95;
        let course = 100;
        let session = 'w';
        let avg = 83;
        let campus = 'ubc';
        let subject = 'cpsc';
        let j = 1;
        while (j < 8) {
            let newSection = new Section();
            newSection.Title = title;
            newSection.Professor = prof;
            newSection.Audit = audit;
            newSection.Withdrew = withdrew;
            newSection.Year = year;
            newSection.Stddev = stddev;
            newSection.High = high;
            newSection.Course = course+j.toString();
            newSection.Session = session;
            newSection.Avg = avg;
            newSection.Campus = campus;
            newSection.Subject = subject

            newSection.Section = j.toString().concat('a');
            newSection.id = '24'.concat(j.toString())
            newSection.Enrolled = 18*j;
            newSection.Pass = newSection.Enrolled*.8;
            newSection.Fail = newSection.Enrolled*.2;
            newSection.Size = newSection.Enrolled;

            sectionArray.push(newSection);
            j++;
        }

        console.log('Z - room array size: ' + roomArray.length);
        console.log('Z - section array size: ' + sectionArray.length);
        
        let controller = new ScheduleController();
        let schedule = controller.makeSchedule(roomArray, sectionArray)

        let class1 = schedule[0];

        return expect(class1.time.time).to.equal(8);
    });
});