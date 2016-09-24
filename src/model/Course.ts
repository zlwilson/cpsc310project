/**
 * Created by pablo on 9/24/16.
 */
export default class Course {

    dept: string;
    num: number;

    result: {};
    rank: number;
    
    createCourse(input: string): Course {
        let course = new Course;
        return course;
    }

    courseID(course: Course): string {
        return course.dept+course.num;
    }
}