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
        return (
            <div>
                <h1>
                    Hello { this.state.name }!
                </h1>
                <div>
                    <input onChange={ e => this.handleOnChange(e) }/>
                </div>
                <button name = "Update" onClick = { e => this.handleOnUpdate(e, this.state.input) }>
                    Update
                </button>
                <button name = "Reset" onClick = { e => this.handleReset(e) }>
                    Reset
                </button>
            </div>
        );
    }
}