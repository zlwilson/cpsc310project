import * as React from "react";
import axios from 'axios';
import {type} from "os";
import Section from "../model/Section";
import ScheduleController from "../controller/ScheduleController";
import TableComponent from "../components/TableComponent";
import Scheduled from "../model/Scheduled";

export interface IQueryProps {
    defaultQuery: string;
}

export interface IQueryRequest {
    GET: string|string[];
    WHERE: any;
    GROUP?: string[];
    APPLY?: any;
    ORDER?: any;
    AS: string;
}

export class QueryComponent extends React.Component<IQueryProps, any> {
    constructor(props:any) {
        super(props);
        //this.state = {query: this.props.defaultQuery};
        this.state = {courseFilters_size_mod: ""};
        this.state = {courseResult:""};
        this.state = {courseSearch:""};
        this.state = {courseFilters_size: 0};
        this.state = {courseFilters_dept: ""};
        this.state = {courseFilters_num: ""};

        //Room
        this.state = {roomResult:""};
        this.state = {roomFilters_size_mod: ""};
        this.state = {roomFilters_building: " "};
        this.state = {nearBuilding: false};

        //Schedule
        this.state = {schedule:""};
    }

    private handleQueryResponse() {

    }

    //Search using IS query, assume only one field searching is valid.
    //@Param: event -> click
    //        input -> field to search
    private handleCourseSearch(event:any, input:any):void {
        // TODO: this is the course search button action, so it should send an AJAX request to courses dataset
        console.log('L - start handling course search with ' + input);

        var query : IQueryRequest = {
            GET:["courses_title", "courses_instructor"],
            WHERE:{
                "AND": [
                    {"OR":[
                        {"IS": {courses_title: input}},
                        {"IS":{courses_instructor:input}}
                        ]},
                {"EQ": {courses_year: 2014}}]},
            AS:'TABLE'};

        var queryJSON = JSON.stringify(query);
        console.log('L - handle course search query string: ' + queryJSON);

        axios.post('http://localhost:4321/query', query).then(res => {
            console.log('Z - got some data!');
            console.log(res.data.result);
            this.setState({courseResult: res.data.result});
            console.log('Z - whats the states result?');
            console.log(this.state.courseResult);
        }).catch( err=>{
            console.log(err);
            }
        );
    }

    private updateCourseSearch(event:any):void {
        //Add * for searching if ever appear in dataset
        this.setState({courseSearch: "*" + event.target.value + "*"});
    }

    private updateCourseFilters(event:any, type:number):void {
        if (type == 1) {
            this.setState({courseFilters_size: event.target.value});
        } else if (type == 2) {
            this.setState({courseFilters_size_mod: event.target.value});
        } else if (type == 3) {
            this.setState({courseFilters_dept: event.target.value });
        } else {
            this.setState({courseFilters_num: event.target.value });
        }
    }

    private applyCourseFilters(event:any):void {
        // TODO: this is the course filter apply button action, so it should send an AJAX request to courses dataset
        var andQuery: any = {"AND":[
            {"EQ":{courses_year:2014}}
        ]};

        console.log(this.state.courseFilters_size + this.state.courseFilters_num + this.state.courseFilters_dept);

        if (typeof this.state.courseFilters_size_mod === "" || typeof this.state.courseFilters_size === "undefined" || this.state.courseFilters_dept === ""){

            if (typeof this.state.courseFilters_dept === "undefined" || this.state.courseFilters_dept === ""){

                if (typeof this.state.courseFilters_num === "undefined" || this.state.courseFilters_num === ""){
                    //Case 1: all left empty -> get all courses

                } else {
                    //Case 2: only course number indicated
                    andQuery["AND"].push({"IS": {courses_id: this.state.courseFilters_num}});
                }
            } else {
                if (typeof this.state.courseFilters_num === "undefined" || this.state.courseFilters_num === ""){
                    //Case 3: only course department indicated
                    andQuery["AND"].push({"IS": {courses_dept: this.state.courseFilters_dept}});
                } else {
                    //Case 4: courses_id and courses_department indicated
                    andQuery["AND"].push({"IS": {courses_dept: this.state.courseFilters_dept}});
                    andQuery["AND"].push({"IS": {courses_id: this.state.courseFilters_num}});
                }
            }
        } else {
            if (typeof this.state.courseFilters_dept === "undefined" || this.state.courseFilters_dept === ""){

                if (typeof this.state.courseFilters_num === "undefined" || this.state.courseFilters_num === ""){
                    //Case 5: only courses_size indicated

                } else {
                    //Case 6: courses_size and courses_id indicated
                    andQuery["AND"].push({"IS": {courses_id: this.state.courseFilters_num}});
                }
            } else {
                if (typeof this.state.courseFilters_num === "undefined" || this.state.courseFilters_num === ""){
                    //Case 7: courses_size and courses_department indicated
                    andQuery["AND"].push({"IS": {courses_dept: this.state.courseFilters_dept}});
                } else {
                    //Case 8: courses_size, courses_id and courses_department indicated
                    andQuery["AND"].push({"IS": {courses_dept: this.state.courseFilters_dept}});
                    andQuery["AND"].push({"IS": {courses_id: this.state.courseFilters_num}});
                }
            }

            var sizeMode = this.state.courseFilters_size_mod;
            switch (sizeMode){
                case 'GT':
                    andQuery['AND'].push({"GT": {courses_size: this.state.courseFilters_size}});
                    break;
                case 'LT':
                    andQuery['AND'].push({'LT': {courses_size: this.state.courseFilters_size}});
                    break;
                case 'EQ':
                    andQuery['AND'].push({'EQ': {courses_size: this.state.courseFilters_size}});
                    break;
                default:
                    console.log("Error in filter course size");
            }
        }

        console.log(andQuery);
        var query : IQueryRequest = {
            GET:["courses_dept", "courses_id", "courses_pass", "courses_fail"],
            WHERE: andQuery,
            AS:'TABLE'
        };

        axios.post('http://localhost:4321/query', query).then(res => {
            console.log(res.data);
            var newResult = res.data.result;
            var oldResult = this.state.courseResult;
            oldResult.filter(function (n:any) {
                return newResult.indexOf(n);
            })

            this.setState({courseResult: oldResult});
            var head:string[] = query.GET as string[];
            this.generateTable(head);
        }).catch( err=>{
                console.log(err);
            }
        );
    }

    private generateTable(head:string[]) {
        var table = document.getElementById("myTable");
        var thead = document.createElement("thead");
        var tbody = document.createElement("tbody");

        table.appendChild(thead);
        table.appendChild(tbody);

        var cols = head.map(function (colData) {
            return <th key={colData}> {colData}</th>
        });
        //thead.appendChild(cols);

        var data = this.state.result.map(function (item: any) {
            var cells = head.map(function (colData) {
                return <td>{item[colData]}</td>;
            });

            return <tr key={item}>{cells}</tr>;
        });
        tbody.appendChild(data);


        // this.state.result.forEach(function (items: any) {
        //     var row = document.createElement("tr");
        //     for (var i in items){
        //         var cell = document.createElement("dt");
        //         cell.textContent = items[i];
        //         row.appendChild(cell);
        //     }
        //
        //     tbody.appendChild(row);
        // });
    }

    private updateCourseSorting(event:any){

    }

    private updateBuilding(event:any):void{

    }

    private toggleNearby(event:any):void{
        if (this.state.nearBuilding === true){
            this.setState({nearbyBuilding: false});
        }
    }

    private updateNearbyRooms(event:any):void{
        if (this.state.nearBuilding === false){
            return;
        }

        //update room lists accordingly
    }



    private handleRoomSearch(event:any, input:any):void {
        // TODO: this is the room search button action, so it should send an AJAX request to rooms dataset
        console.log('L - start handling room search with ' + input);

        var query : IQueryRequest = {
            GET:["rooms_fullname","rooms_number", "rooms_name"],
            WHERE:{
                "OR":[
                        {"IS": {rooms_fullname: input}},
                        {"IS":{rooms_number:input}}
                    ]},
            AS:'TABLE'};

        var queryJSON = JSON.stringify(query);
        console.log('L - handle room search query string: ' + queryJSON);

        axios.post('http://localhost:4321/query', query).then(res => {
            console.log('Z - got some data!');
            console.log(res.data);
            this.setState({result: res.data});
            console.log('Z - whats the states result?');
            console.log(this.state.result.result);
        }).catch( err=>{
                console.log(err);
            }
        );
    }

    private updateRoomSearch(event:any):void {
        this.setState({roomSearch: event.target.value});
    }

    private applyRoomFilters(event:any, input:any):void {
        // TODO: this is the room filter apply button action, so it should send an AJAX request to rooms dataset
        var andQuery: any = {"AND":[
            {"LT":{rooms_lat:100}}
        ]};

        console.log(this.state.roomFilters_size + this.state.roomFilters_furniture + this.state.roomFilters_type);

        if (typeof this.state.roomFilters_size_mod === "" || typeof this.state.roomFilters_size === "undefined" || this.state.roomFilters_size === ""){

            if (typeof this.state.roomFilters_type === "undefined" || this.state.roomFilters_type === ""){

                if (typeof this.state.roomFilters_furniture === "undefined" || this.state.roomFilters_furniture === ""){
                    //Case 1: all left empty -> get all courses

                } else {
                    //Case 2: only room furniture indicated
                    andQuery["AND"].push({"IS": {rooms_furniture: this.state.roomFilters_furniture}});
                }
            } else {
                if (typeof this.state.roomFilters_furniture === "undefined" || this.state.roomFilters_furniture === ""){
                    //Case 3: only room type indicated
                    andQuery["AND"].push({"IS": {rooms_type: this.state.roomFilters_type}});
                } else {
                    //Case 4: room type and furniture indicated
                    andQuery["AND"].push({"IS": {rooms_type: this.state.roomFilters_type}});
                    andQuery["AND"].push({"IS": {rooms_furniture: this.state.roomFilters_furniture}});
                }
            }
        } else {
            if (typeof this.state.roomFilters_type === "undefined" || this.state.roomFilters_type === ""){

                if (typeof this.state.roomFilters_furniture === "undefined" || this.state.roomFilters_furniture === ""){
                    //Case 5: only room size indicated

                } else {
                    //Case 6: room size and furniture indicated
                    andQuery["AND"].push({"IS": {rooms_furniture: this.state.roomFilters_furniture}});
                }
            } else {
                if (typeof this.state.roomFilters_furniture === "undefined" || this.state.roomFilters_furniture === ""){
                    //Case 7: room size and type indicated
                    andQuery["AND"].push({"IS": {rooms_type: this.state.roomFilters_type}});
                } else {
                    //Case 8: room size, type and furniture indicated
                    andQuery["AND"].push({"IS": {rooms_type: this.state.roomFilters_type}});
                    andQuery["AND"].push({"IS": {rooms_furniture: this.state.roomFilters_furniture}});
                }
            }

            var sizeMode = this.state.roomFilters_size_mod;
            switch (sizeMode){
                case 'GT':
                    andQuery['AND'].push({"GT": {rooms_seats: this.state.roomFilters_size}});
                    break;
                case 'LT':
                    andQuery['AND'].push({'LT': {rooms_seats: this.state.roomFilters_size}});
                    break;
                case 'EQ':
                    andQuery['AND'].push({'EQ': {rooms_seats: this.state.roomFilters_size}});
                    break;
                default:
                    console.log("Error in filter room size");
            }
        }

        console.log(andQuery);
        var query : IQueryRequest = {
            GET:["rooms_name", "rooms_fullname", "rooms_seats", "rooms_type", "rooms_furniture"],
            WHERE: andQuery,
            AS:'TABLE'
        };

        axios.post('http://localhost:4321/query', query).then(res => {
            console.log(res.data);
            var newResult = res.data.result;
            var oldResult = this.state.roomResult;
            oldResult.filter(function (n:any) {
                return newResult.indexOf(n);
            })

            this.setState({roomResult: oldResult});
            var head:string[] = query.GET as string[];
            this.generateTable(head);
        }).catch( err=>{
                console.log(err);
            }
        );
    }

    private updateRoomFilters(event:any, type:number):void {
        if (type == 1) {
            this.setState({roomFilters_size_mod: event.target.value});
        } else if (type == 2) {
            this.setState({roomFilters_size: event.target.value});
        } else if (type == 4) {
            this.setState({roomFilters_furniture: event.target.value});
        } else {
            this.setState({roomFilters_type: event.target.value});
        }
    }

    private renderCourseTableRow(array: Section[]): JSX.Element {
        for (let i in array) {
            return (
                <tr>
                    <th> { array[i].Title } </th>
                    <th> { array[i].Professor } </th>
                </tr>
            )
        }
    }

    private renderCoursesTable(result: any): JSX.Element {
        return (
            <table>
                <thead>
                <tr>
                    <th>Title</th>
                    <th>Instructor</th>
                </tr>
                </thead>
                <tbody>
                { this.renderCourseTableRow(this.state.courseResult) }
                </tbody>
            </table>
        )
    }



    private handleScheduler(event: any, rooms: any, sections: any) {
        let controller = new ScheduleController();
        let schedule = controller.makeSchedule(rooms, sections);

        this.state.schedule = schedule;
    }

    private renderScheduleTableRow(array: Scheduled[]): JSX.Element {
        for (let i in array) {
            return (
                <tr>
                    <th> { array[i].Section.Title } </th>
                    <th> { array[i].Section.Section } </th>
                    <th> { array[i].Room.name } </th>
                    <th> { array[i].time } </th>
                </tr>
            )
        }
    }

    private renderScheduleTable(): JSX.Element {
        if (this.state.schedule == "") {
            return null;
        } else {
            return (
                <table>
                    <thead>
                    <tr>
                        <th>Title</th>
                        <th>Section</th>
                        <th>Room</th>
                        <th>Time</th>
                    </tr>
                    </thead>
                    <tbody>
                    { this.renderScheduleTableRow(this.state.courseResult) }
                    </tbody>
                </table>
            );
        }
    }

    componentDidMount() {

    }

    render() {
        var style1 = {
            backgroundColor: 'rgb(240,250,255)',
            float: 'left',
            borderStyle: 'solid',
            borderWidth: '1px',
            width: '100%'
        };
        var style11 = {
            backgroundColor: 'rgb(240,250,255)',
            float: 'left',
            width: '33%'
        };
        var style111 = {
            backgroundColor: 'rgb(240,250,255)',
            float: 'right',
            width: '30%'
        }
        var style110 = {
            backgroundColor: 'rgb(240,250,255)',
            float: 'right',
            width: '18%'
        }
        var style2 = {
            backgroundColor: 'rgb(240,255,250)',
            float: 'left',
            borderStyle: 'solid',
            borderWidth: '1px',
            width: '100%'
        };
        var style21 = {
            backgroundColor: 'rgb(240,255,250)',
            float: 'left',
            width: '33%'
        };
        var style215 = {
            backgroundColor: 'rgb(240,255,250)',
            float: 'left',
            width: '50%'
        };


        var experiment = ['some', 'fake', 'options','to', 'test'];
        var makeSelectItem = function (x:any):any { return <option value={x}>{x}</option>; };

        return (
            <div>
                <div id='title'>
                    <h3>UBC Course Catalog</h3>
                    <h4>Search: { this.state.query }</h4>
                </div>
                <div id='searchbar'>
                    <div style={style1}>
                        <h4>Course Xplorer</h4>
                        <div>
                            <p>Search the course catalog by course title or instructor:</p>
                            <input onChange={ e => this.updateCourseSearch(e) }/>
                            <button name="SearchCourses"
                                    onClick={ e => this.handleCourseSearch(e, this.state.courseSearch) }>
                                Search
                            </button>
                        </div>
                        <div>
                            <h4>Filters</h4>
                            <div>
                                <div style={style11}>
                                    <p>Size:
                                        <select value={this.state.name}
                                                onChange={ e => this.updateCourseFilters(e, 2) }>
                                            <option value={""}> - </option>
                                            <option value="GT">Greater Than</option>
                                            <option value="LT">Less Than</option>
                                            <option value="EQ">Equal To</option>
                                        </select>
                                        <input onChange={ e => this.updateCourseFilters(e, 1) }/>
                                    </p>
                                </div>
                                <div style={style11}>
                                    <p>Dept:
                                        <input onChange={ e => this.updateCourseFilters(e, 3) }/>
                                    </p>
                                </div>
                                <div style={style11}>
                                    <p>Number:
                                        <input onChange={ e => this.updateCourseFilters(e, 4) }/>
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div style={style110}>
                            <button name="ApplyCourses"
                                    onClick={ e => this.applyCourseFilters(e) }>
                                Apply
                            </button>
                        </div>
                        <div>
                            <h5>Filters:</h5>
                            <p>Size:  { this.state.courseFilters_size_mod } { this.state.courseFilters_size }</p>
                            <p>Dept: { this.state.courseFilters_dept }</p>
                            <p>Number: { this.state.courseFilters_num }</p>
                            <div>

                                <div style={style110}>
                                    <p>
                                        <input type="checkbox" name="sortAvg" value="avg"
                                               onChange={ e => this.updateCourseSorting(e)}>
                                        </input>
                                        average
                                    </p>
                                </div>

                                <div style={style110}>
                                    <p>
                                        <input type="checkbox" name="sortFail" value="fail"
                                               onChange={ e => this.updateCourseSorting(e)}>
                                        </input>
                                        most failing
                                    </p>
                                </div>

                                <div style={style111}>
                                    <p>
                                        Sort by:
                                        <input type="checkbox" name="sortPass" value="pass"
                                               onChange={ e => this.updateCourseSorting(e)}>
                                        </input>
                                        most passing
                                    </p>
                                </div>

                            </div>
                        </div>
                        <div id='result'>
                            <h4>Results</h4>
                            <TableComponent defaultHeader="courses" data={this.state.courseResult}/>
                            { this.renderCoursesTable(this.state.courseResult) }
                        </div>
                    </div>
                    <div style={style2}>
                        <h4>Room Xplorer</h4>
                        <div>
                            <p>Search the rooms of UBC by building or room number:</p>
                            <input onChange={ e => this.updateRoomSearch(e)  }/>
                            <button name="SearchRooms"
                                    onClick={ e => this.handleRoomSearch(e, this.state.roomSearch)  }>
                                Search
                            </button>
                        </div>
                        <div>
                            <h4>Filters</h4>
                            <div>
                                <div style={style215}>
                                    <p> List Rooms in Building:
                                        <select value={this.state.name} onChange={ e => this.updateBuilding(e) }>
                                            <option value="1">pseudo building 1</option>
                                            <option value="2">pseudo building 2</option>
                                            <option value="3">pseudo building 3</option>
                                        </select>
                                    </p>
                                </div>
                                <div style={style215}>
                                    <p>
                                        <input type="checkbox" name="nearBuilding" value="near"
                                               onChange={ e => this.toggleNearby(e)}>
                                        </input>
                                        in
                                        <select value={this.state.name} onChange={ e => this.updateNearbyRooms(e) }>
                                            {experiment.map(makeSelectItem)}
                                        </select>
                                        meters
                                    </p>
                                </div>
                            </div>

                            <div>
                                <div style={style21}>
                                    <p>Size:
                                        <select value={this.state.name} onChange={ e => this.updateRoomFilters(e, 1) }>
                                            <option value={""}> - </option>
                                            <option value="GT">Greater Than</option>
                                            <option value="LT">Less Than</option>
                                            <option value="EQ">Equal To</option>
                                        </select>
                                        <input onChange={ e => this.updateRoomFilters(e, 2) }/>
                                    </p>
                                </div>
                                <div style={style21}>
                                    <p>Type:
                                        <select value={this.state.name} onChange={ e => this.updateRoomFilters(e, 3) }>
                                            <option value="Small Group">Small Group</option>
                                            <option value="Tiered Large Group">Tiered Large Group</option>
                                            <option value="Open Design General Purpose">Open Design General Purpose</option>
                                            <option value="Case Style">Case Style</option>
                                        </select>
                                    </p>
                                </div>
                                <div style={style21}>
                                    <p>Furniture:
                                        <select value={this.state.name} onChange={ e => this.updateRoomFilters(e, 4) }>
                                            <option value="Classroom-Movable Tables & Chairs">Movable Tables & Chairs</option>
                                            <option value="Classroom-Fixed Tables/Movable Chairs">Fixed Tables/Movable Chairs</option>
                                            <option value="Classroom-Movable Tablets">Movable Tablets</option>
                                            <option value="Classroom-Fixed Tablets">Fixed Tablets</option>
                                        </select>
                                    </p>
                                </div>
                            </div>
                            <button name="ApplyRooms"
                                    onClick={ e => this.applyRoomFilters(e, this.state.roomFilters) }>
                                Apply
                            </button>
                        </div>
                        <div>
                            <h5>Filters:</h5>
                            <p>Size: { this.state.roomFilters_size_mod } { this.state.roomFilters_size }</p>
                            <p>Furniture: { this.state.roomFilters_furniture }</p>
                            <p>Type: { this.state.roomFilters_type }</p>
                        </div>
                    </div>
                </div>
                <div id="scheduler">
                    <h4>Scheduler</h4>
                    <p>Click to schedule the selected courses into the selected rooms</p>
                    <button name="makeSchedule" onClick={ e => this.handleScheduler(e, this.state.roomResult, this.state.courseResult) }>
                        Create!
                    </button>
                    { this.renderScheduleTable() }
                    <TableComponent defaultHeader='schedule' data={this.state.schedule}/>
                </div>
            </div>
        );
    }
}