import ReactDOM from "react-dom";
import App from "./App";

import 'antd/dist/antd.dark.css';
import "./styles/index.css";
import "./styles/global.css";
import moment from 'moment-timezone';
moment.tz.setDefault("America/Los_Angeles");
ReactDOM.render(<App />, document.getElementById("root"));
