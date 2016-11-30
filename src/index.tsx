import * as React from "react";
import * as ReactDOM from "react-dom";

import { QueryComponent } from "./components/QueryComponent";
import { ManageDatasets } from "./components/ManageDatasets";

const root = document.getElementById('root');

class Main extends React.Component<any, any> {
    constructor(props: any){
        super(props);
    }

    render() {
        return (
            <div>
                    <p></p>
                    <QueryComponent defaultQuery='[no query yet]' />
            </div>
        );
    }
}

ReactDOM.render(<Main />, root);