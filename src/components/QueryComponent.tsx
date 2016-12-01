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
        this.state = {
            //courses
            courseFilters_size_mod: "",
            courseSearchResult:[],
            courseFilterResult:[],
            courseResult:[],
            courseSearch:"",
            courseFilters_size: 0,
            courseFilters_dept: "",
            courseFilters_num: "",

            //Room
            roomSearchResult:[],
            roomFilterResult:[],
            roomResult: [],
            roomSearch:"",
            roomFilters_size: 0,
            roomFilters_size_mod: "",
            roomFilters_building: "",
            roomFilters_type: "",
            nearBuilding: false,

            //Schedule
            schedule:""
        };

    }

    private handleQueryResponse() {

    }

    //Search using IS query, assume only one field searching is valid.
    //@Param: event -> click
    //        input -> field to search
    private handleCourseSearch(event:any, input:any):void {
        // TODO: this is the course search button action, so it should send an AJAX request to courses dataset
        console.log('L - start handling course search with ' + input);
        let that = this;

        if(input === ""){
            this.setState({courseSearchResult:[]});
            this.mergeCourseResult();
            return;
        }

        var query : IQueryRequest = {
            GET:["courses_title", "courses_instructor", "courses_size"],
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

            this.setState({courseSearchResult: res.data.result});

            console.log('Z - whats the states result?');
            console.log(this.state.courseResult);

            this.mergeCourseResult();

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
                    //Case 1: all left empty -> nothing shown
                    this.setState({courseFilterResult:[]});
                    this.mergeCourseResult();
                    return;

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

            this.setState({courseFilterResult: res.data.result});
            this.mergeCourseResult();
        }).catch( err=>{
                console.log(err);
            }
        );

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

        if(input === ""){
            this.setState({roomSearchResult:[]});
            this.mergeRoomResult();
            return;
        }

        var query : IQueryRequest = {
            GET:["rooms_fullname","rooms_number", "rooms_name", "rooms_seats"],
            WHERE:{
                "OR":[
                        {"IS": {rooms_fullname: input}},
                        {"IS": {rooms_shortname:input}},
                        {"IS":{rooms_number:input}}
                    ]},
            AS:'TABLE'};

        var queryJSON = JSON.stringify(query);
        console.log('L - handle room search query string: ' + queryJSON);

        axios.post('http://localhost:4321/query', query).then(res => {
            console.log('Z - got some data!');
            console.log(res.data);
            this.setState({roomSearchResult: res.data});
            console.log('Z - whats the states result?');
            console.log(this.state.result.result);
            this.mergeRoomResult();
        }).catch( err=>{
                console.log(err);
            }
        );
    }

    private updateRoomSearch(event:any):void {
        this.setState({roomSearch: "*" + event.target.value + "*"});
    }

    private applyRoomFilters(event:any, input:any):void {
        // TODO: this is the room filter apply button action, so it should send an AJAX request to rooms dataset
        var andQuery: any = {"AND":[
            //Why are we doing that?
            {"LT":{rooms_lat:100}}
        ]};

        console.log(this.state.roomFilters_size + this.state.roomFilters_furniture + this.state.roomFilters_type);

        if (typeof this.state.roomFilters_size_mod === "" || typeof this.state.roomFilters_size === "undefined" || this.state.roomFilters_size === ""){

            if (typeof this.state.roomFilters_type === "undefined" || this.state.roomFilters_type === ""){

                if (typeof this.state.roomFilters_furniture === "undefined" || this.state.roomFilters_furniture === ""){
                    //Case 1: all left empty -> nothing shown
                    this.setState({roomFilterResult:[]});
                    this.mergeRoomResult();
                    return;

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

            this.setState({roomFilterResult: res.data.result});
            this.mergeRoomResult();

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


    //combine search and filter result, generate table, and render
    private mergeCourseResult(){
        var searchResult = this.state.courseSearchResult;
        var filterResult = this.state.courseFilterResult;
        var result:any = [];

        if(filterResult.length === 0){
            if (searchResult.length === 0){
                this.setState({courseResult: []});
            } else {
                this.setState({courseResult: searchResult});
            }
        } else {
            if (searchResult.length === 0){
                this.setState({courseResult: filterResult});
            } else {

                result = searchResult.filter(function (n:any) {
                    return filterResult.indexOf(n);
                });

                this.setState({courseResult: result});
            }
        }

        //generate table and render here
        //this.generateTable();

    }

    private mergeRoomResult() {

        var searchResult = this.state.roomSearchResult;
        var filterResult = this.state.roomFilterResult;
        var result:any = [];

        if (filterResult.length === 0) {
            if (searchResult.length === 0) {
                this.setState({roomResult: []});
            } else {
                this.setState({roomResult: searchResult});
            }
        } else {
            if (searchResult.length === 0) {
                this.setState({roomResult: filterResult});
            } else {

                result = searchResult.filter(function (n: any) {
                    return filterResult.indexOf(n);
                });

                this.setState({roomResult: result});
            }
        }
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


    private renderCourseTableRow(): JSX.Element {

        console.log(this.state.courseSearchResult);
        var array:any = this.state.courseSearchResult;
        // var something = this.state.courseFilters_dept;
        // var some = this.state.courseFilters_num;
        // return (
        //     <tr key= { 1 }>
        //         <th> {something} </th>
        //         <th> {some} </th>
        //     </tr>
        // )
        for (var i = 1; i < array.length + 1; i++){
                array[i-1]["key"] = i;
        }

        var rows = array.map(function (n:any) {
            console.log(n);
            return (
                <tr key={n.key}>
                    <th> {n.key} </th>
                    <th> { n.courses_title} </th>
                    <th> { n.courses_instructor } </th>
                </tr>
            )
        });

        return rows;
    }

    private renderCoursesTable(): JSX.Element {
        return (
            <table id="coursesTable">
                <thead>
                <tr>
                    <th>No.</th>
                    <th>Title</th>
                    <th>Instructor</th>
                </tr>
                </thead>
                <tbody>
                { this.renderCourseTableRow() }
                </tbody>
            </table>
        )
    }



    private handleScheduler(event: any, rooms: any, sections: any) {
        let controller = new ScheduleController();

        // console.log('Z - rooms and sections');
        // console.log(rooms);
        // console.log(sections);

        let schedule = controller.makeSchedule(rooms, sections);
        let quality = controller.checkQuality(schedule);

        console.log(schedule);
        console.log('Quality = ' + quality);

        this.state.schedule = schedule;
        this.render();
    }

    private renderScheduleTableRow(array: Scheduled[]): JSX.Element {
        for (let i in array) {
            return (
                <tr key= { array[i].Room.name + array[i].time.time } >
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
                <table key="scheduleTable">
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
                            {this.renderCoursesTable()}
                        </div>
                    </div>
                    <div style={style2}>
                        <h4>Room Xplorer</h4>
                        <div>
                            <p>Search the rooms of UBC by building (full name or abbreviation) or room number:</p>
                            <input onChange={ e => this.updateRoomSearch(e)  }/>
                            <button name="SearchRooms"
                                    onClick={ e => this.handleRoomSearch(e, this.state.roomSearch)  }>
                                Search
                            </button>
                        </div>
                        <div>
                            <h4>Filters</h4>
                            {/*
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
                            */}

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
                                            <option value=""> - choose type - </option>
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
                                            <option value=""> - choose furniture - </option>
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
                <div id="scheduler" style={style1}>
                    <h4>Scheduler</h4>
                    <p>Click to schedule the selected courses into the selected rooms</p>
                    <button name="makeSchedule" onClick={ e => this.handleScheduler(e, this.state.roomResult, this.state.courseResult) }>
                        Create!
                    </button>
                    { this.renderScheduleTable() }
                </div>
            </div>
        );
    }
}