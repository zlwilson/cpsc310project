import * as React from "react";
import * as ReactDOM from "react-dom";

import { QueryComponent } from "./components/QueryComponent";
import { ManageDatasets } from "./components/ManageDatasets";

const root = document.getElementById('root');

class Main extends React.Component<any, any> {
    constructor(props: any){
        super(props);
    }

    public render() {
        return (
            <body>
                <div>
                    <p>Hello world</p>
                    <QueryComponent defualtQuery='[no query yet]' />
                </div>
            </body>
        );
    }
}

ReactDOM.render(<Main />, root);