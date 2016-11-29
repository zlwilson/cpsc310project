import * as React from "react";
import Section from "../model/Section";
import Room from "../model/Room";
import ScheduleController from "../controller/ScheduleController";
import Scheduled from "../model/Scheduled";

export default class TableComponent extends React.Component<any, any> {

    constructor(props: any) {
        super(props);
        this.state = { type: this.props.defaultHeader };
        this.state = { data: this.props.data };
    }

    private renderScheduleRows(data: Scheduled[]): JSX.Element {
        for (let i in data) {
            return (
                <tr>
                    <td>data[i][0].Title</td>
                    <td>data[i][0].Section</td>
                    <td>data[i][1].name</td>
                    <td>data[i][2]</td>
                </tr>
            )
        }
    }

    private renderRoomRows(data: Room[]): JSX.Element {
        for (let i in data) {
            return (
                <tr>
                    <td>data[i].name</td>
                    <td>data[i].Seats</td>
                    <td>data[i].FullName</td>
                </tr>
            )
        }
    }

    private renderCourseRows(data: Section[]): JSX.Element {
        for (let i in data) {
            return (
                <tr>
                    <td>data[i].Professor</td>
                    <td>data[i].Title</td>
                    <td>data[i].Section</td>
                    <td>data[i].Size</td>
                </tr>
            )
        }
    }

    render() {
        if (this.state.type == 'schedule') {
            return (
                <table>
                    <thead>
                        <th>
                            <tr>Title</tr>
                            <tr>Section</tr>
                            <tr>Room</tr>
                            <tr>Time</tr>
                        </th>
                    </thead>
                    <tbody>
                        {this.renderScheduleRows(this.state.data)}
                    </tbody>
                </table>
            );
        } else if (this.state.type == 'rooms') {
            return (
                <table>
                    <thead>
                    <th>
                        <tr>Name</tr>
                        <tr>Size</tr>
                        <tr>Building</tr>
                    </th>
                    </thead>
                    <tbody>
                        {this.renderRoomRows(this.state.data)}
                    </tbody>
                </table>
            );
        } else if (this.state.type == 'courses') {
            return (
                <table>
                    <thead>
                    <th>
                        <tr>Professor</tr>
                        <tr>Title</tr>
                        <tr>Section</tr>
                        <tr>Size</tr>
                    </th>
                    </thead>
                    <tbody>
                        {this.renderCourseRows(this.state.data)}
                    </tbody>
                </table>
            );
        } else {
            return null;
        }
    }
}