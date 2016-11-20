import * as React from "react";

export interface HelloProps {
    compiler: string;
    framework: string;
}

export class Hello extends React.Component<any, any> {
    constructor(props: any){
        super(props);
        this.state = { name: this.props.defaultName };
    }

    public handleOnClick(event: any) : void {
        this.setState({ name: "Charles" });
    }

    public render() {
        return (
            <div>
                <h1>
                    Hello { this.state.name }!
                </h1>
                <button name = "Update" onClick = { e => this.handleOnClick(e) }>
                    Update
                </button>
            </div>
        );
    }
}