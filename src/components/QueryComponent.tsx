import * as React from "react";

export interface HelloProps {
    compiler: string;
    framework: string;
}

export class QueryComponent extends React.Component<any, any> {
    constructor(props: any){
        super(props);
        this.state = { query: this.props.defaultQuery };
        this.state = { courseFilters_size_mod: 'GT' };
        this.state = { roomFilters_size_mod: 'GT' };
    }

    public handleCourseSearch(event: any, input: any) : void {
        this.setState({ query: input });
    }

    public updateCourseSearch(event: any): void {
        this.setState({ courseSearch: 'courses.get: ' + event.target.value });
    }

    public applyCourseFilters(event: any, input: any) : void {
        // TODO: sort query results (ie: new querry with filter values
        this.setState({ courseFilters: input});
    }

    public updateCourseFilters(event: any, type: number): void {
        if (type == 1) {
            this.setState({ courseFilters_size_mod: event.target.value });
        } else if (type == 2) {
            this.setState({ courseFilters_size: event.target.value });
        } else if (type == 3) {
            this.setState({ courseFilters_dept: event.target.value });
        } else {
            this.setState({ courseFilters_num: event.target.value });
        }
    }

    public handleRoomSearch(event: any, input: any) : void {
        this.setState({ query: input});
    }

    public updateRoomSearch(event: any): void {
        this.setState({ roomSearch: 'rooms.get: ' + event.target.value });
    }

    public applyRoomFilters(event: any, input: any) : void {
        this.setState({ query: input});
    }

    public updateRoomFilters(event: any, type: number): void {
        if (type == 1) {
            this.setState({ roomFilters_size_mod: event.target.value });
        } else if (type == 2) {
            this.setState({ roomFilters_size: event.target.value });
        } else if (type == 4) {
            this.setState({ roomFilters_furniture: event.target.value });
        } else {
            this.setState({ roomFilters_type: event.target.value });
        }
    }

    public render() {
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
                            <p>Search the course catalog by course name, department or instructor:</p>
                            <input onChange={ e => this.updateCourseSearch(e) }/>
                            <button name = "SearchCourses" onClick = { e => this.handleCourseSearch(e, this.state.courseSearch) }>
                                Search
                            </button>
                        </div>
                        <div>
                            <h4>Filters</h4>
                            <button name = "ApplyCourses" onClick = { e => this.applyCourseFilters(e, this.state.courseFilters) }>
                                Apply
                            </button>
                            <div>
                                <div style={style11}>
                                    <p>Size:
                                        <select value={this.state.name} onChange={ e => this.updateCourseFilters(e, 2) }>
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
                            <button name = "SearchRooms" onClick = { e => this.handleRoomSearch(e, this.state.roomSearch)  }>
                                Search
                            </button>
                        </div>
                        <div>
                            <h4>Filters</h4>
                            <button name = "ApplyRooms" onClick = { e => this.applyCourseFilters(e, this.state.roomFilters) }>
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
                    TODO: render query response here
                </div>
            </div>
        );
    }
}