import React, { Component } from 'react';
import wagon from './media/wagon.png';
import pixelUSA from './media/pixel_usa.svg'
import pixelMap from './media/pixel_map.json'
import tweets from './media/tweets.json'
import './App.css';
// change for mobile?
const pixelScale = 12;

class App extends Component {
  render() {
    var coords = tweets[0]["coordinates"]["coordinates"]
    var pathCoords = []
    console.log(coords)
    // top left coords in pixelMap
    // tweets are in [long, lat]
    for(var i=0; i< pixelMap.length; i++){
        // -122.14310264,37.05701649
        // "longitude":-122.4992,"latitude":37.6336
        if(pixelMap[i]["latitude"]>coords[1] && pixelMap[i]["longitude"]<coords[0] && pixelMap[i]["latitude"]-0.81<coords[1] && pixelMap[i]["longitude"]+0.81>coords[0]) {
            pathCoords.push(pixelMap[i]["coords"]);
        }
    }
    const pathPixels = pathCoords.map((coord) =>
      <div className="path-pixel" style={{position: 'absolute', left:coord[0]*pixelScale+2, top:coord[1]*pixelScale-3}}>
          <div className="path-square hover-zoom"/>
      </div>
    );
    return (
      <div className="App">
        <div className="App-header">
          <img src={wagon} className="App-logo" alt="logo" />
          Iron Maps
          <img src={wagon} className="App-logo" alt="logo" />
        </div>
        <div className="map">
            {pathPixels}
        </div>
      </div>
    );
  }
}
// <p className="App-intro">
//   To get started, edit <code>src/App.js</code> and save to reload.
// </p>
// <div>
//   <button type="button" className="btn btn-primary">Primary</button>
// </div>

export default App;
