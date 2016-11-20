import * as React from "react";
import * as ReactDOM from "react-dom";

import { Hello } from "./components/Hello";
import { ManageDatasets } from "./components/ManageDatasets";

const root = document.getElementById('example');

class Main extends React.Component<any, any> {
    constructor(props: any){
        super(props);
    }

    public render() {
        return (
            <body>
                <div>
                    <Hello defaultName='World' />
                </div>
                <div>
                    <ManageDatasets defaultName='[none]'/>
                </div>
            </body>
        );
    }
}

ReactDOM.render(<Main />, root);