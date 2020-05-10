import React from "react";
import "./App.scss";
import NavBar from "./components/NavBar";
import Login from "./routes/Login";
import Profile from "./routes/Profile";
import TeacherHome from "./routes/teacher/Home";
import StudentHome from "./routes/student/Home";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { Auth0Provider } from "./react-auth0-spa.js";
import config from "./auth_config.json";
import history from "./utils/history";

const onRedirectCallback = (appState) => {
  history.push(
    appState && appState.targetUrl
      ? appState.targetUrl
      : window.location.pathname
  );
};
export default function App() {
  return (
    // <Auth0Provider
    //   domain={config.domain}
    //   client_id={config.clientId}
    //   redirect_uri={window.location.origin}
    //   onRedirectCallback={onRedirectCallback}
    // >
      <BrowserRouter>
        {/* <NavBar> */}
          <Switch>
            <Route exact path="/" component={Login} />
            <Route exact path="/login" component={Login} />
            <Route exact path="/teacher/dashboard" component={TeacherHome} />
            <Route exact path="/student/dashboard" component={StudentHome} />
            {/* <Route exact path="/view-profile" component={Profile} />
            <Route component={() => <div>404</div>} /> */}
          </Switch>
        {/* </NavBar> */}
      </BrowserRouter>
    // </Auth0Provider>
  );
}
