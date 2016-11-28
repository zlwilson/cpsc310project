import * as React from "react";
import axios from 'axios';
import {type} from "os";

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
        this.state = {result:""};
        this.state = {courseSearch:""};
        this.state = {courseFilters_size: 0};
        this.state = {courseFilters_dept: ""};
        this.state = {courseFilters_num: ""};

        //Room
        this.state = {roomFilters_size_mod: 'GT'};
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
            console.log(res.data);
            this.setState({result: res.data});
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

        if (typeof this.state.courseFilters_size_mod === "" ||typeof this.state.courseFilters_size === "undefined" || this.state.courseFilters_dept === ""){

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
            var oldResult = this.state.result;
            oldResult.filter(function (n:any) {
                return newResult.indexOf(n);
            })

            this.setState({result: oldResult});

            var table = document.getElementById("myTable");
            var thead = document.createElement("thead");
            var tbody = document.createElement("tbody");

            table.appendChild(thead);
            table.appendChild(tbody);

            var headRow = document.createElement("tr");
            thead.appendChild(headRow);

            var head:string[] = query.GET as string[];
            head.forEach(function (field: string) {
                var headCell = document.createElement("dt");
                headCell.textContent = field;
                headRow.appendChild(headCell);
            })

            oldResult.forEach(function (items: any) {
                var row = document.createElement("tr");
                for (var i in items){
                    var cell = document.createElement("dt");
                    cell.textContent = items[i];
                    row.appendChild(cell);
                }

                tbody.appendChild(row);
            });

        }).catch( err=>{
                console.log(err);
            }
        );
    }

    private handleRoomSearch(event:any, input:any):void {
        // TODO: this is the room search button action, so it should send an AJAX request to rooms dataset
        this.setState({query: input});
    }

    private updateRoomSearch(event:any):void {
        this.setState({roomSearch: 'rooms.get: ' + event.target.value});
    }

    private applyRoomFilters(event:any, input:any):void {
        // TODO: this is the room filter apply button action, so it should send an AJAX request to rooms dataset
        this.setState({query: input});
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

    componentDidMount() {

    }

    render() {
        var style1 = {
            backgroundColor: 'rgb(240,250,255)',
            float: 'left',
            width: '50%'
        };
        var style11 = {
            backgroundColor: 'rgb(240,250,255)',
            float: 'left',
            width: '33%'
        };
        var style2 = {
            backgroundColor: 'rgb(240,255,250)',
            float: 'left',
            width: '50%'
        };
        var style21 = {
            backgroundColor: 'rgb(240,255,250)',
            float: 'left',
            width: '33%'
        };

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
                            <button name="ApplyRooms"
                                    onClick={ e => this.applyRoomFilters(e, this.state.roomFilters) }>
                                Apply
                            </button>
                            <div>
                                <div style={style21}>
                                    <p>Size:
                                        <select value={this.state.name} onChange={ e => this.updateRoomFilters(e, 1) }>
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
                                            <option value="Small">Small</option>
                                            <option value="Big">Big</option>
                                            <option value="Medium">Medium</option>
                                        </select>
                                    </p>
                                </div>
                                <div style={style21}>
                                    <p>Furniture:
                                        <select value={this.state.name} onChange={ e => this.updateRoomFilters(e, 4) }>
                                            <option value="Lots">Lots</option>
                                            <option value="None">None</option>
                                            <option value="Some">Some</option>
                                        </select>
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h5>Filters:</h5>
                            <p>Size: { this.state.roomFilters_size_mod } { this.state.roomFilters_size }</p>
                            <p>Furniture: { this.state.roomFilters_furniture }</p>
                            <p>Type: { this.state.roomFilters_type }</p>
                        </div>
                    </div>
                </div>
                <div id='result'>
                    <p>Before my AJAX tag...</p>
                    {/*<Ajax url="" onResponse={this.handleQueryResponse()}/>*/}
                        <p>After my AJAX tag.</p>
                    <table id="myTable" class="tablesorter">
                    </table>

                </div>
            </div>
        );
    }
}