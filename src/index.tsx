import * as React from "react";
import * as ReactDOM from "react-dom";

import { QueryComponent } from "./components/QueryComponent";
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
                    <ManageDatasets defaultName='[none]'/>
                </div>
                <div>
                    <QueryComponent defaultName='World' />
                </div>
            </body>
        );
    }
}

ReactDOM.render(<Main />, root);