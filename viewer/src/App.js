import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import MapComponent from './components/MapComponent';
import NewMapComponent from './components/NewMapComponent';

export default function App() {
  return (
    <Router>
      <div>
        {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
        <Switch>
          <Route path="/map/2021">
            <MapComponent/>
          </Route>
          <Route path="/map">
            <MapComponent/>
          </Route>
          <Route path="/new">
            <NewMapComponent/>
          </Route>
          <Route path="/">
            <MapComponent/>
          </Route>
        </Switch>
      </div>
    </Router>
  );
}