import * as React from "react";
import axios from 'axios';

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
        this.state = {result:''};
        this.state = {courseSearch:""};
        this.state = {courseFilters_size: ""};
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

        var query : IQueryRequest = {GET:["courses_title", "courses_instructor"], WHERE:{"OR": [{"IS": {courses_title: input }}, {"IS": {courses_instructor:  input }}]}, AS:'TABLE'};
        var queryJSON = JSON.stringify(query);
        console.log('L - handle course search query string: ' + queryJSON);

        axios.post('http://localhost:4321/query', query).then(res => {
            console.log(res.data);
            this.setState({result: res.data});
        }).catch( err=>{
            console.log(err);
            }
        );


        // React.createElement(Ajax, {url: 'http://localhost:4321', method: 'POST', body: this.state.query});
    }

    private updateCourseSearch(event:any):void {
        //Add * for searching if ever appear in dataset
        this.setState({courseSearch: "*" + event.target.value + "*"});
    }

    private updateCourseFilters(event:any, type:number):void {
        if (type == 1) {
            this.setState({courseFilters_size_mod: event.target.value});
        } else if (type == 2) {
            this.setState({courseFilters_size: event.target.value});
        } else if (type == 3) {
            this.setState({courseFilters_dept: event.target.value});
        } else {
            this.setState({courseFilters_num: event.target.value});
        }
    }

    private applyCourseFilters(event:any, input:any):void {
        // TODO: this is the course filter apply button action, so it should send an AJAX request to courses dataset
        this.setState({courseFilters: input});
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
                            <button name="ApplyCourses"
                                    onClick={ e => this.applyCourseFilters(e, this.state.courseFilters) }>
                                Apply
                            </button>
                            <div>
                                <div style={style11}>
                                    <p>Size:
                                        <select value={this.state.name}
                                                onChange={ e => this.updateCourseFilters(e, 2) }>
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
                                    onClick={ e => this.applyCourseFilters(e, this.state.roomFilters) }>
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
                    {/*<table id="myTable" class="tablesorter">*/}
                        {/*<thead>*/}
                        {/*<tr>*/}
                            {/*<th>Last Name</th>*/}
                            {/*<th>First Name</th>*/}
                            {/*<th>Email</th>*/}
                            {/*<th>Due</th>*/}
                            {/*<th>Web Site</th>*/}
                        {/*</tr>*/}
                        {/*</thead>*/}
                        {/*<tbody>*/}
                        {/*<tr>*/}
                            {/*<td>Smith</td>*/}
                            {/*<td>John</td>*/}
                            {/*<td>jsmith@gmail.com</td>*/}
                            {/*<td>$50.00</td>*/}
                            {/*<td>http://www.jsmith.com</td>*/}
                        {/*</tr>*/}
                        {/*<tr>*/}
                            {/*<td>Bach</td>*/}
                            {/*<td>Frank</td>*/}
                            {/*<td>fbach@yahoo.com</td>*/}
                            {/*<td>$50.00</td>*/}
                            {/*<td>http://www.frank.com</td>*/}
                        {/*</tr>*/}
                        {/*<tr>*/}
                            {/*<td>Doe</td>*/}
                            {/*<td>Jason</td>*/}
                            {/*<td>jdoe@hotmail.com</td>*/}
                            {/*<td>$100.00</td>*/}
                            {/*<td>http://www.jdoe.com</td>*/}
                        {/*</tr>*/}
                        {/*<tr>*/}
                            {/*<td>Conway</td>*/}
                            {/*<td>Tim</td>*/}
                            {/*<td>tconway@earthlink.net</td>*/}
                            {/*<td>$50.00</td>*/}
                            {/*<td>http://www.timconway.com</td>*/}
                        {/*</tr>*/}
                        {/*</tbody>*/}
                    {/*</table>*/}
                </div>
            </div>
        );
    }
}