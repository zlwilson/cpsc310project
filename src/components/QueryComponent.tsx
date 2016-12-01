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
            courseFilters_size: -1,
            courseFilters_dept: "",
            courseFilters_num: "",
            courseSearchEmpty: true,
            courseFilterEmpty: true,
            sortAvg: true,
            sortFail: false,
            sortPass: false,

            //Room
            roomSearchResult:[],
            roomFilterResult:[],
            roomResult: [],
            roomSearch:"",
            roomFilters_size: -1,
            roomFilters_size_mod: "",
            roomFilters_building: "",
            roomFilters_type: "",
            nearBuilding: false,
            roomSearchEmpty: true,
            roomFilterEmpty: true,

            //Schedule
            schedule:""
        };

    }

    private handleQueryResponse() {

    }

    //Search using IS query, assume only one field searching is valid.
    //@Param: event -> click
    //        input -> field to search
    private handleCourseSearch(input:any):void {
        // TODO: this is the course search button action, so it should send an AJAX request to courses dataset
        console.log('L - start handling course search with ' + input);
        console.log(this.state.sortAvg);
        let that = this;

        this.setState({courseSearch: input});
        if(input === "**" || input === ""){
            this.setState({courseSearchEmpty: true});
            this.setState({courseSearchResult:[]});
            this.mergeCourseResult();
            return;
        }
        this.setState({courseSearchEmpty: false});


        var query : IQueryRequest = {
            GET:["courses_title", "courses_instructor", "courses_size", "courses_dept", "courses_id", "courses_avg", "courses_fail", "courses_pass"],
            WHERE:{
                "AND": [
                    {"OR":[
                        {"IS": {courses_title: input}},
                        {"IS":{courses_instructor:input}}
                        ]},
                {"EQ": {courses_year: 2014}}]},

            AS:'TABLE'};

            if (this.state.sortAvg === false){
                if(this.state.sortFail === false){
                    if (this.state.sortPass === false){

                    } else {
                        query.ORDER =  { "dir": "DOWN", "keys": ["courses_pass"]};
                    }
                } else {
                    if (this.state.sortPass === false){
                        query.ORDER = { "dir": "DOWN", "keys": ["courses_fail"]};
                    } else {
                        query.ORDER =  { "dir": "DOWN", "keys": ["courses_fail", "courses_pass"]};
                    }
                }
            }else {
                if(this.state.sortFail === false){
                    if (this.state.sortPass === false){
                        query.ORDER =  { "dir": "DOWN", "keys": ["courses_avg"]};
                    } else {
                        query.ORDER =  { "dir": "DOWN", "keys": ["courses_pass", "courses_avg"]};
                    }
                } else {
                    if (this.state.sortPass === false){
                        query.ORDER = { "dir": "DOWN", "keys": ["courses_fail", "courses_avg"]};
                    } else {
                        query.ORDER =  { "dir": "DOWN", "keys": ["courses_fail", "courses_pass", "courses_avg"]};
                    }
                }
            }

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
        this.setState({courseSearchEmpty: false});
        if(event.target.value === ""){
            this.setState({courseSearchEmpty: true});
        }
        this.setState({courseSearch: "*" + event.target.value + "*"});
    }

    private updateCourseFilters(event:any, type:number):void {
        if (type == 1) {
            if (event.target.value === ""){
                console.log("L - suppose to be empty value here" + event.target.value);
                this.setState({courseFilters_size: -1});
            } else {
                this.setState({courseFilters_size: event.target.value});
            }
        } else if (type == 2) {
            this.setState({courseFilters_size_mod: event.target.value});
        } else if (type == 3) {
            this.setState({courseFilters_dept: event.target.value });
        } else {
            this.setState({courseFilters_num: event.target.value });
        }
    }

    private applyCourseFilters():void {
        // TODO: this is the course filter apply button action, so it should send an AJAX request to courses dataset
        var andQuery: any = {"AND":[
            {"EQ":{courses_year:2014}}
        ]};

        this.setState({courseFilterEmpty:false});
        console.log(this.state.courseFilters_size + this.state.courseFilters_num + this.state.courseFilters_dept);

        if (typeof this.state.courseFilters_size_mod === "" || typeof this.state.courseFilters_size === "undefined" || this.state.courseFilters_size === -1){

            if (typeof this.state.courseFilters_dept === "undefined" || this.state.courseFilters_dept === ""){

                if (typeof this.state.courseFilters_num === "undefined" || this.state.courseFilters_num === ""){
                    //Case 1: all left empty -> nothing shown
                    this.setState({courseFilterEmpty:true});
                    this.setState({courseFilterResult:[]});
                    console.log(this.state.courseSearchResult);
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
            GET:["courses_title", "courses_instructor", "courses_size", "courses_dept", "courses_id", "courses_avg", "courses_fail", "courses_pass"],
            WHERE: andQuery,
            AS:'TABLE'
        };
        console.log(this.state.sortAvg);
        if (this.state.sortAvg === false){
            if(this.state.sortFail === false){
                if (this.state.sortPass === false){

                } else {
                    query.ORDER =  { "dir": "DOWN", "keys": ["courses_pass"]};
                }
            } else {
                if (this.state.sortPass === false){
                    query.ORDER = { "dir": "DOWN", "keys": ["courses_fail"]};
                } else {
                    query.ORDER =  { "dir": "DOWN", "keys": ["courses_fail", "courses_pass"]};
                }
            }
        }else {
            if(this.state.sortFail === false){
                if (this.state.sortPass === false){
                    query.ORDER =  { "dir": "DOWN", "keys": ["courses_avg"]};
                } else {
                    query.ORDER =  { "dir": "DOWN", "keys": ["courses_pass", "courses_avg"]};
                }
            } else {
                if (this.state.sortPass === false){
                    query.ORDER = { "dir": "DOWN", "keys": ["courses_fail", "courses_avg"]};
                } else {
                    query.ORDER =  { "dir": "DOWN", "keys": ["courses_fail", "courses_pass", "courses_avg"]};
                }
            }
        }

        axios.post('http://localhost:4321/query', query).then(res => {
            console.log(res.data);

            this.setState({courseFilterResult: res.data.result});
            this.mergeCourseResult();
        }).catch( err=>{
                console.log(err);
            }
        );

    }


    private updateCourseSorting(event:any):void{

        console.log(this.state.sortAvg);
        switch (event.target.value){
            case 'avg':
                if (this.state.sortAvg == false){
                    this.setState({sortAvg: true});
                } else {
                    this.setState({sortAvg: false});
                }

                break;
            case 'fail':
                if (this.state.sortFail == false){
                    this.setState({sortFail:true});
                } else {
                    this.setState({sortFail:false});
                }

                break;
            case "pass":
                if (this.state.sortPass == false){
                    this.setState({sortPass:true});
                } else {
                    this.setState({sortPass:false});
                }

                break;
            default:
                console.log(event.target.value);
        }

    }

    private updateCourseTable():void{
        this.handleCourseSearch(this.state.courseSearch);
        this.applyCourseFilters();
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

        if(input === "**" || input === ""){
            this.setState({roomSearchEmpty: true});
            this.setState({roomSearchResult:[]});
            this.mergeRoomResult();
            return;
        }
        this.setState({roomSearchEmpty: false});
        var query : IQueryRequest = {
            GET:["rooms_fullname", "rooms_shortname","rooms_number", "rooms_name", "rooms_seats", "rooms_type", "rooms_furniture"],
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
            this.setState({roomSearchResult: res.data.result});
            console.log('Z - whats the states result?');
            console.log(this.state.roomSearchResult);
            this.mergeRoomResult();
        }).catch( err=>{
                console.log(err);
            }
        );
    }

    private updateRoomSearch(event:any):void {
        this.setState({roomSearchEmpty: false});
        if(event.target.value === ""){
            this.setState({roomSearchEmpty: true});
        }
        this.setState({roomSearch: "*" + event.target.value + "*"});
    }

    private applyRoomFilters(event:any, input:any):void {
        // TODO: this is the room filter apply button action, so it should send an AJAX request to rooms dataset
        var andQuery: any = {"AND":[
            //Why are we doing that?
            {"LT":{rooms_lat:100}}
        ]};

        this.setState({roomFilterEmpty: false});
        console.log(this.state.roomFilters_size + this.state.roomFilters_furniture + this.state.roomFilters_type);

        if (typeof this.state.roomFilters_size_mod === "" || typeof this.state.roomFilters_size === "undefined" || this.state.roomFilters_size === -1){

            if (typeof this.state.roomFilters_type === "undefined" || this.state.roomFilters_type === ""){

                if (typeof this.state.roomFilters_furniture === "undefined" || this.state.roomFilters_furniture === ""){
                    //Case 1: all left empty -> nothing shown
                    this.setState({roomFilterEmpty: true});
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
            GET:["rooms_fullname", "rooms_shortname","rooms_number", "rooms_name", "rooms_seats", "rooms_type", "rooms_furniture"],
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
            if (event.target.value === ""){
                console.log("L - suppose to be empty value here" + event.target.value);
                this.setState({roomFilters_size: -1});
            } else {
                this.setState({roomFilters_size: event.target.value});
            }
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
        console.log(searchResult);
        console.log(filterResult);

        if(this.state.courseFilterEmpty === true){
            if (this.state.courseSearchEmpty === true){
                console.log("both empty");
                this.setState({courseResult: []});
            } else {
                console.log("empty filter");
                this.setState({courseResult: searchResult});
            }
        } else {
            if (this.state.courseSearchEmpty === true){
                console.log("empty search");
                this.setState({courseResult: filterResult});
            } else {
                console.log("None empty");

                for (var f in filterResult){
                    for (var s in searchResult){
                        if (filterResult[f].courses_title + filterResult[f].courses_instructor + filterResult[f].courses_size
                            === searchResult[s].courses_title + searchResult[s].courses_instructor + searchResult[s].courses_size){
                            result.push(filterResult[f]);
                        }
                    }
                }

                this.setState({courseResult: result});
            }
        }

        console.log(this.state.courseResult);

    }

    private mergeRoomResult() {

        var searchResult = this.state.roomSearchResult;
        var filterResult = this.state.roomFilterResult;
        var result:any = [];

        console.log(searchResult);
        console.log(filterResult);

        if(this.state.roomFilterEmpty === true){
            if (this.state.roomSearchEmpty === true){
                console.log("both empty");
                this.setState({roomResult: []});
            } else {
                console.log("empty filter");
                this.setState({roomResult: searchResult});
            }
        } else {
            if (this.state.roomSearchEmpty === true){
                console.log("empty search");
                this.setState({roomResult: filterResult});
            } else {
                console.log("None empty");

                for (var f in filterResult){
                    for (var s in searchResult){
                        if (filterResult[f].rooms_name
                            === searchResult[s].rooms_name){
                            result.push(filterResult[f]);
                        }
                    }
                }

                this.setState({roomResult: result});
            }
        }

    }


    private renderCourseTableRow(): JSX.Element {

        var array:any = this.state.courseResult;
        console.log(array);
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
            return (
                <tr key={n.key}>
                    <th> { n.courses_title} </th>
                    <th> { n.courses_instructor } </th>
                    <th> { n.courses_id } </th>
                    <th> { n.courses_dept } </th>
                    <th> { n.courses_size } </th>
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
                    <th>Title</th>
                    <th>Instructor</th>
                    <th>Course Number</th>
                    <th>Department</th>
                    <th>Section Size</th>
                </tr>
                </thead>
                <tbody>
                { this.renderCourseTableRow() }
                </tbody>
            </table>
        )
    }

    private renderRoomsTableRow(): JSX.Element {

        var array:any = this.state.roomResult;
        console.log(array);

        for (var i = 1; i < array.length + 1; i++){
            array[i-1]["key"] = i;
        }

        var rows = array.map(function (n:any) {
            return (
                <tr key={n.key}>
                    <th> { n.rooms_fullname} </th>
                    <th> { n.rooms_number } </th>
                    <th> { n.rooms_seats } </th>
                    <th> { n.rooms_type } </th>
                    <th> { n.rooms_furniture } </th>
                </tr>
            )
        });

        return rows;
    }

    private renderRoomsTable(): JSX.Element {
        return (
            <table id="roomsTable">
                <thead>
                <tr>
                    <th>Building Name</th>
                    <th>Room Number</th>
                    <th>Room Size</th>
                    <th>Room Type</th>
                    <th>Room Furniture</th>
                </tr>
                </thead>
                <tbody>
                { this.renderRoomsTableRow() }
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

    private renderScheduleTableRow(): JSX.Element {
        var array : any = this.state.courseResult;

        var rows = array.map(function (n:any) {
            return (
                <tr key= { n.Room.name + n.time.time } >
                    <th> { n.Section.Title } </th>
                    <th> { n.Section.Section } </th>
                    <th> { n.Room.name } </th>
                    <th> { n.time } </th>
                </tr>
            )
        });

        return rows;
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
                    { this.renderScheduleTableRow() }
                    </tbody>
                </table>
            );
        }
    }

    componentDidUpdate( prevProp: any, prevState: any) {
        if (prevState.sortAvg !== this.state.sortAvg || prevState.sortPass !== this.state.sortPass || prevState.sortFail !== this.state.sortFail){
            this.updateCourseTable();
        }
        console.log("component did update");
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
                                    onClick={ e => this.handleCourseSearch(this.state.courseSearch) }>
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
                                    onClick={ e => this.applyCourseFilters() }>
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
                                        <input type="checkbox" name="sortAvg" value="avg" checked={ this.state.sortAvg}
                                               onChange={ e => this.updateCourseSorting(e)}>
                                        </input>
                                        average
                                    </p>
                                </div>

                                <div style={style110}>
                                    <p>
                                        <input type="checkbox" name="sortFail" value="fail" checked={ this.state.sortFail}
                                               onChange={ e => this.updateCourseSorting(e)}>
                                        </input>
                                        most failing
                                    </p>
                                </div>
                                <div style={style111}>
                                    <p>
                                        Sort by:
                                        <input type="checkbox" name="sortPass" value="pass" checked={ this.state.sortPass}
                                               onChange={ e => this.updateCourseSorting(e)}>
                                        </input>
                                        most passing
                                    </p>
                                </div>


                            </div>
                        </div>
                        <div id='courseResult'>
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
                        <div id='roomResult'>
                            <h4>Results</h4>
                            {this.renderRoomsTable()}
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
                <div id='scheduleResult'>
                    <h4>Results</h4>
                    {this.renderScheduleTable()}
                </div>
            </div>
        );
    }
}