import React, { Component } from 'react';
import wagon from './media/wagon.png';
import pixelUSA from './media/pixel_usa.svg'
import pixelMap from './media/pixel_map.json'
import tweets from './media/tweets.json'
import tripTotals from "./media/totals.json"
import PixelSquare from "./components/PixelSquare.jsx"
import './App.css';
// change for mobile?
const pixelScale = 12;

class App extends Component {
  constructor(props) {

    var coords = tweets[0]["coordinates"]["coordinates"]
    var pathPixelDetails = []
    console.log(coords)
    // top left coords in pixelMap
    // tweets are in [long, lat]
    // for(var i=0; i< pixelMap.length; i++){
    //     -122.14310264,37.05701649
    //     "longitude":-122.4992,"latitude":37.6336
    //     if(pixelMap[i]["latitude"]>coords[1] && pixelMap[i]["longitude"]<coords[0] && pixelMap[i]["latitude"]-0.81<coords[1] && pixelMap[i]["longitude"]+0.81>coords[0]) {
    //         pathCoords.push(pixelMap[i]["coords"]);
    //     }
    // }
    for(var i=0; i< tweets.length; i++) {
        var foundCoord = false
        for(var j=0; j<pathPixelDetails.length; j++) {
            if(pathPixelDetails[j]["coords"] == tweets[i]["pixel_coords"]) {
                pathPixelDetails[j]["tweets"].push(tweets[i]);
                foundCoord = true;
                break;
            }
        }
        if(!foundCoord) {
            pathPixelDetails.push({
                "coords": tweets[i]["pixel_coords"],
                "tweets": [tweets[i]],
                "visible": false
            })
        }
    }
    console.log(pathPixelDetails)

    super(props);
    this.state = {pathPixelDetails: pathPixelDetails};
  }

  showPixelSquare(pathPixelIndex) {
    // console.log(pathPixelIndex)
    // console.log(this)
    // console.log(pixelDetail)
    // pathPixelDetails
    // this.state.pathPixelDetails[pathPixelIndex].visible = !this.state.pathPixelDetails[pathPixelIndex].visible;
    // console.log(this.state.pathPixelDetails)

    const pathPixelDetails = this.state.pathPixelDetails;
    pathPixelDetails[pathPixelIndex].visible = !pathPixelDetails[pathPixelIndex].visible;
    this.setState({pathPixelDetails: pathPixelDetails})
  }

  render() {
    const pathPixels = this.state.pathPixelDetails.map((pathPixelDetail, index) =>
      <div className="path-pixel" style={{position: 'absolute', left:pathPixelDetail["coords"][0]*pixelScale+2, top:pathPixelDetail["coords"][1]*pixelScale-3}}>
          <PixelSquare pathPixelIndex={index} pathPixel={pathPixelDetail} onPixelClick={(event) => { this.showPixelSquare(event) }}/>
      </div>
    );
    const totals = (
        <div className="legend">
            <div className="legend-labels">
                <div className="legend-label">Miles</div>
                <div className="legend-label">Quests</div>
                <div className="legend-label">Jokes</div>
            </div>
            <div className="legend-values">
                <div className="legend-value">{tripTotals["miles"]}</div>
                <div className="legend-value">{tripTotals["quests_completed"]+'/'+tripTotals["quests"]}</div>
                <div className="legend-value">{tripTotals["jokes"]}</div>
            </div>
        </div>
    )

    return (
      <div className="App">
        <div className="App-header">
          <img src={wagon} className="App-logo" alt="logo" />
          Iron Maps
          <img src={wagon} className="App-logo" alt="logo" />
        </div>
        <div className="map">
            {pathPixels}
            {totals}
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
