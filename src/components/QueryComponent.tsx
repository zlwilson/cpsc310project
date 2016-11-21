import * as React from "react";

export interface HelloProps {
    compiler: string;
    framework: string;
}

export class QueryComponent extends React.Component<any, any> {
    constructor(props: any){
        super(props);
        this.state = { name: this.props.defaultName };
    }

    public handleReset(event: any): void {
        if (this.state.name != 'World') {
            this.setState({ name: "World" });
        }
    }

    public handleOnUpdate(event: any, input: any) : void {
        this.setState({ name: this.state.input });
    }

    public handleOnChange(event: any) : void {
        this.setState({ input: event.target.value });
    }

    public render() {
        var style1 = {
            backgroundColor: 'rgb(240,250,255)',
            float: 'left',
            width: '33%'
        };
        var style2 = {
            backgroundColor: 'rgb(240,255,250)',
            float: 'left',
            width: '33%'
        };
        return (
            <div>
                <p>Change me using those 2 buttons</p>
                <h3>
                    Hello { this.state.name }!
                </h3>
                <input onChange={ e => this.handleOnChange(e) }/>
                <button name = "Update" onClick = { e => this.handleOnUpdate(e, this.state.input) }>
                    Update
                </button>
                <button name = "Reset" onClick = { e => this.handleReset(e) }>
                    Reset
                </button>
                <h3>UBC Course Catalog</h3>
                <div style={style1}>
                    <h4>Course Xplorer</h4>
                    <div>
                        <p>Search the course catalog by course name or department:</p>
                        <input onChange={ e => this.handleOnChange(e) }/>
                        <button name = "SearchCourses" onClick = { e => this.handleReset(e) }>
                           Search
                        </button>
                    </div>
                    <div>
                        <h4>Filters</h4>
                        <div>
                            <p>Section Size:
                                <input onChange={ e => this.handleOnChange(e) }/>
                            </p>
                            <p>Department:
                                <input onChange={ e => this.handleOnChange(e) }/>
                            </p>
                            <p>Course Number:
                                <input onChange={ e => this.handleOnChange(e) }/>
                            </p>
                            <p>Instructor:
                                <input onChange={ e => this.handleOnChange(e) }/>
                            </p>
                        </div>
                        <button name = "ApplyCourses" onClick = { e => this.handleReset(e) }>
                        Apply
                    </button>
                    </div>
                </div>
                <div style={style2}>
                    <h4>Room Xplorer</h4>
                    <div>
                        <p>Search the rooms of UBC by building or room number:</p>
                        <input onChange={ e => this.handleOnChange(e) }/>
                        <button name = "SearchRooms" onClick = { e => this.handleReset(e) }>
                            Search
                        </button>
                    </div>
                    <div>
                        <h4>Filters</h4>
                        <div>
                            <p>Room Size:
                                <input onChange={ e => this.handleOnChange(e) }/>
                            </p>
                            <p>Room Type:
                                <input onChange={ e => this.handleOnChange(e) }/>
                            </p>
                            <p>Furniture Type:
                                <input onChange={ e => this.handleOnChange(e) }/>
                            </p>
                        </div>
                        <button name = "ApplyRooms" onClick = { e => this.handleReset(e) }>
                            Apply
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}