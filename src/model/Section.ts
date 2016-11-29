/**
 * Created by pablo on 9/24/16.
 */
export default class Section {
    Title: string;
    Section: string;
    id: string;
    Professor: string;
    Audit: number;
    Withdrew: number
    Year: number;
    Stddev: number;
    Enrolled: number;
    High: number;
    Course: string;
    Session: string;
    Pass: number;
    Fail: number;
    Avg: number;
    Campus: string;
    Subject: string;
    Size: number;

    constructor () {}

    // constructor (title: string, section: string, id: string, prof: string, audit: number, withdrew: number, year: number, stddev: number, enrolled: number, high: number, course: string, session: string, pass: number, fail: number, avg: number, campus: string, subject: string) {
    //     this.Title = title;
    //     this.Section = section;
    //     this.id = id;
    //     this.Professor = prof;
    //     this.Audit = audit;
    //     this.Withdrew = withdrew;
    //     this.Year = year;
    //     this.Stddev = stddev;
    //     this.Enrolled = enrolled;
    //     this.High = high;
    //     this.Course = course;
    //     this.Session = session;
    //     this.Pass = pass;
    //     this.Fail = fail;
    //     this.Avg = avg;
    //     this.Campus = campus;
    //     this.Subject = subject;
    // };

    // public fromJson(json: string): Section {
    //     var obj = JSON.parse (json);
    //     return new Section (obj.Title, obj.Section, obj.id, obj.Professor, obj.Audit, obj.Withdrew, obj.Year, obj.Stddev, obj.Enrolled, obj.High, obj.Course, obj.Session, obj.Pass, obj.Fail, obj.Avg, obj.Campus, obj.Subject);
    // };

}