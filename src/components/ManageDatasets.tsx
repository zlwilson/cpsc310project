import * as React from "react";

export class ManageDatasets extends React.Component<any, any> {
    constructor(props: any){
        super(props);
        this.state = { name: this.props.defaultName };
    }

    public handleDelete(event: any, input: any): void {
        // TODO: delete dataset here
        this.setState({ name: "deleted dataset with id: " + this.state.input });
    }

    public handleOnUpload(event: any, input: any) : void {
        // TODO: PUT dataset here
        this.setState({ name: 'added dataset with id: ' + this.state.input });
    }

    public handleOnChange(event: any) : void {
        this.setState({ input: event.target.value });
    }

    public render() {
        var style = {
            backgroundColor: 'rgb(240,250,255)'
        };
        return (
            <div style={style}>
                <h3>
                    Manage Datasets
                </h3>
                <div>
                    <input onChange={ e => this.handleOnChange(e) }/>
                </div>
                <button name = "Upload" onClick = { e => this.handleOnUpload(e, this.state.input) }>
                    Upload
                </button>
                <button name = "Delete" onClick = { e => this.handleDelete(e, this.state.input) }>
                    Delete
                </button>
                <h4>
                    Action: { this.state.name }
                </h4>
            </div>
        );
    }
}