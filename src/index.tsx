import * as React from "react";
import * as ReactDOM from "react-dom";

import { Hello } from "./components/Hello";

const root = document.getElementById('example');

class Main extends React.Component<any, any> {
    constructor(props: any){
        super(props);
    }

    public render() {
        return (
            <div>
                <Hello defaultName='World' />
            </div>
        );
    }
}

ReactDOM.render(<Main />, root);