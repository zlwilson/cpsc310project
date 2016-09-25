/**
 * Created by pablo on 9/24/16.
 */

import Section from "../model/Section";

export default class Course {

    dept: string;
    num: number;
    rank: number;

    sections: Section[];
    
    createCourse(name: string): Course {
        let course = new Course;
        course.dept = name.substr(0,3);
        course.num = +name.substr(4,6);
        course.sections = [];
        return course;
    }

    courseID(course: Course): string {
        return course.dept+course.num;
    }
}