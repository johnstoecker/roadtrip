import React, { Component } from 'react';
import wagon from './media/wagon.png';
import pixelUSA from './media/pixel_usa.svg'
import pixelMap from './media/pixel_map.json'
// import tweets from './media/tweets.json'
import tripTotals from "./media/totals.json"
import PixelSquare from "./components/PixelSquare.jsx"
import $ from 'jquery';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isPlaying: false,
      currentIndex: -1,
      currentInnerIndex: -1,
      currentPathIndex: 0,
      pathPixelDetails: [],
      tweets: [],
      miles: 0,
      jokes: 0,
      questsAccepted: 0,
      questsCompleted: 0,
      width: '0',
      height: '0'
    }
    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
  }

  componentDidMount() {
    this.updateWindowDimensions();
    window.addEventListener('resize', this.updateWindowDimensions);
    this.getTweets();
  }

  componentWillUnmount() {
    this.clearTimeout()
    window.removeEventListener('resize', this.updateWindowDimensions);
  }

  updateWindowDimensions() {
    this.setState({ width: window.innerWidth, height: window.innerHeight });
  }

  // switched lat/lon params up, twitter coordinates, also converted to miles
  // (from https://stackoverflow.com/questions/27928/calculate-distance-between-two-latitude-longitude-points-haversine-formula )
  getDistanceFromLonLat(lon1,lat1,lon2,lat2) {
    var R = 3959; // Radius of the earth in miles
    var dLat = this.deg2rad(lat2-lat1);  // deg2rad below
    var dLon = this.deg2rad(lon2-lon1);
    var a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon/2) * Math.sin(dLon/2)
      ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c; // Distance in miles
    return d;
  }

  deg2rad(deg) {
    return deg * (Math.PI/180)
  }

  getTweets() {
    // FML
    var that = this;
    $.getJSON('http://ironmaps.com:5001', function(data) {
      var tweets = data["tweets"];
      var miles=0,jokes=0,questsAccepted=0,questsCompleted = 0;
      var lastCoordinates = null

      var pathPixelDetails = []
      for(var i=0; i< tweets.length; i++) {
          tweets[i]["text"] = tweets[i]["text"].replace(/\shttps:\/\/t.co\/\S*/, "")
          if(tweets[i]["text"].toLowerCase().indexOf("quest accept") != -1) {
            questsAccepted += 1;
          }
          if(tweets[i]["text"].toLowerCase().indexOf("quest complete") != -1) {
            questsCompleted += 1;
          }
          if(tweets[i]["coordinates"]){
            if(lastCoordinates != null) {
              miles+= that.getDistanceFromLonLat(lastCoordinates[0], lastCoordinates[1], tweets[i]["coordinates"]["coordinates"][0], tweets[i]["coordinates"]["coordinates"][1])
            }
            lastCoordinates = tweets[i]["coordinates"]["coordinates"]
          }
          if(lastCoordinates == null)
          tweets.visible = false;
          if(i!=0 && !tweets[i]["pixel_coords"] && tweets[i-1]["pixel_coords"]) {
            // if we have no location data, just use the previous location
            tweets[i]["pixel_coords"] = tweets[i-1]["pixel_coords"]
          }
          var foundCoord = false
          for(var j=0; j<pathPixelDetails.length; j++) {
              if(tweets[i]["pixel_coords"] && pathPixelDetails[j]["coords"][0] == tweets[i]["pixel_coords"][0] && pathPixelDetails[j]["coords"][1] == tweets[i]["pixel_coords"][1]) {
                  pathPixelDetails[j]["tweets"].push(tweets[i]);
                  foundCoord = true;
                  break;
              }
          }
          if(!foundCoord && tweets[i]["pixel_coords"]) {
              pathPixelDetails.push({
                  "coords": tweets[i]["pixel_coords"],
                  "tweets": [tweets[i]],
                  "visible": false
              })
          }
      }
      console.log(pathPixelDetails)

      that.setState({pathPixelDetails: pathPixelDetails, tweets: tweets, miles: miles.toFixed(0)}, questsCompleted: questsCompleted, questsAccepted: questsAccepted);
    })
  }

  pause() {
    this.clearTimeout()
    this.setState({isPlaying: false})
  }

  play() {
    this.state.isPlaying = true
    this.showNext(false);
  }

  onKeyDown(keyCode) {
    console.log("hi")
    console.log(keyCode.keyCode)
    if(keyCode.keyCode == 37) {
      this.goToPrevious()
    } else if(keyCode.keyCode == 39) {
      this.goToNext()
    } else if(keyCode.keyCode == 32) {
      if (this.state.isPlaying) {
        this.pause()
      } else (
        this.play()
      )
    }
  }

  goToNext() {
    this.pause()
    this.showNext(false)
  }

  goToPrevious() {
    this.pause()
    this.showNext(true)
  }

  // this function name is bad, yeah i know....
  showNext(reverse = false) {
    console.log(reverse)
    if(reverse) {
      var currentInnerIndex = this.state.currentInnerIndex - 1;
      var currentIndex = this.state.currentIndex - 1;
    } else {
      var currentInnerIndex = this.state.currentInnerIndex + 1;
      var currentIndex = this.state.currentIndex + 1;
    }
    var currentPathIndex = null
    console.log(currentIndex)
    if(currentIndex < this.state.tweets.length && currentIndex >=0) {
      const currentTweet = this.state.tweets[currentIndex]
      if(currentTweet["pixel_coords"]) {
        var foundCoord = false;
        for(var j=0; j<this.state.pathPixelDetails.length; j++) {
            if(currentTweet["pixel_coords"] && this.state.pathPixelDetails[j]["coords"][0] == currentTweet["pixel_coords"][0] && this.state.pathPixelDetails[j]["coords"][1] == currentTweet["pixel_coords"][1]) {
                for(var k=0; k<this.state.pathPixelDetails[j]["tweets"].length; k++) {
                  if(this.state.pathPixelDetails[j]["tweets"][k]["id"] === currentTweet["id"]) {
                    currentInnerIndex = k
                  }
                }
                var currentPathIndex = j
                foundCoord = true;
                break;
            }
        }

        if(currentPathIndex != null) {
          this.setState({
            currentPathIndex: currentPathIndex,
            currentInnerIndex: currentInnerIndex,
            currentIndex: currentIndex
          }, () => {
            this.showPixelSquare(currentPathIndex, false, currentInnerIndex)
            if(this.state.isPlaying) {
              this.timeout = window.setTimeout(this.showNext.bind(this, false), 1500);
            }
          });

        } else {
          // TODO: what to do when we can't find the coords?
          console.log("cant find coords to show current tweet")
          this.setState({
            currentPathIndex: currentPathIndex,
            // should this be 0???
            currentInnerIndex: 0,
            currentIndex: currentIndex
          });
          this.showNext(false);
        }
      } else {
        // current tweet has no pixel coords
        console.log("current tweet has no coords")
        this.setState({
          currentPathIndex: currentPathIndex,
          currentInnerIndex: 0,
          currentIndex: currentIndex
        });
        this.showNext(false);
      }
    // we have reached the end
    } else {
      console.log("we have reached the end")
      this.pause()
      this.setState({
        currentPathIndex: -1,
        currentInnerIndex: -1,
        currentIndex: 0
      })
      // TODO: maybe stop? or just show play button?
    }
  }

  clearTimeout = () => {
      window.clearTimeout(this.timeout);
  }

  closePixel(pathPixelIndex) {
    console.log('closing')
    const pathPixelDetails = this.state.pathPixelDetails;
    pathPixelDetails[pathPixelIndex].visible = false;
    this.setState({pathPixelDetails: pathPixelDetails})
  }

  showPixelSquare(pathPixelIndex, allTweets = true, currentInnerIndex = 0) {
    console.log(currentInnerIndex)
    const pathPixelDetails = this.state.pathPixelDetails;
    for(var j=0; j<pathPixelDetails.length; j++) {
      pathPixelDetails[j].visible = false
    }
    if(allTweets) {
      for(var i=0; i< pathPixelDetails[pathPixelIndex].tweets.length; i++) {
        pathPixelDetails[pathPixelIndex].tweets[i].visible = true
      }
    } else {
      for(var i=0; i< pathPixelDetails[pathPixelIndex].tweets.length; i++) {
        pathPixelDetails[pathPixelIndex].tweets[i].visible = false
      }
      pathPixelDetails[pathPixelIndex].tweets[currentInnerIndex].visible = true
    }
    pathPixelDetails[pathPixelIndex].visible = !pathPixelDetails[pathPixelIndex].visible;
    this.setState({pathPixelDetails: pathPixelDetails})
  }

  render() {
    const pathPixels = (this.state.pathPixelDetails || []).map((pathPixelDetail, index) => {
      // yes, yes, these should be constants.....
      // 12 -- normal window
      // 6 -- small window (phone)
      // 3 -- tiny (small phone)
      var leftPos = (pathPixelDetail["coords"][0]+1)*(12+2)
      var topPos = pathPixelDetail["coords"][1]*(12+2)-1
      if(this.state.width <= 525) {
        var leftPos = Math.floor((pathPixelDetail["coords"][0]+2)*(3.5))-4
        var topPos = Math.floor(pathPixelDetail["coords"][1]*(3.5))
      } else if (this.state.width <= 1050) {
        var leftPos = (pathPixelDetail["coords"][0]+1)*(6+1)
        var topPos = (pathPixelDetail["coords"][1]+1)*(6+1)-7
      }
      return (<div className="path-pixel" style={{position: 'absolute', left: leftPos, top:topPos}}>
          <PixelSquare pathPixelIndex={index} pathPixel={pathPixelDetail} closePixel={(event) => { this.closePixel(event) }} onPixelClick={(event) => { this.showPixelSquare(event) }}/>
      </div>)
    }
    );
    const totals = (
        <div className="legend">
            <div className="legend-labels">
                <div className="legend-label">Miles</div>
                <div className="legend-label">Quests</div>
                <div className="legend-label">Jokes</div>
            </div>
            <div className="legend-values">
                <div className="legend-value">{this.state.miles}</div>
                <div className="legend-value">{this.state.questsCompleted+'/'+this.state.questsAccepted}</div>
                <div className="legend-value">{tripTotals["jokes"]}</div>
            </div>
        </div>
    )

    const navigation = (
      <div className="navigation ignore-react-onclickoutside">
        <div className="navigator navigate-left" onClick={this.goToPrevious.bind(this)}>←</div>
        <div className={"navigator navigate-play " + (this.state.isPlaying && 'hidden')} onClick={this.play.bind(this)}>▶</div>
        <div className={"navigator navigate-pause " +(this.state.isPlaying || 'hidden')} onClick={this.pause.bind(this)}>❚❚</div>
        <div className="navigator navigate-right"onClick={this.goToNext.bind(this)}>→</div>
      </div>
    )

    return (
      <div className="App" onKeyDown={(e) => this.onKeyDown(e)} tabIndex="0">
        <div className="App-header">
          <img src={wagon} className="App-logo" alt="logo" />
          Iron Maps
          <img src={wagon} className="App-logo App-logo-second" alt="logo" />
        </div>
        {navigation}
        <div className="map">
            {pathPixels}
            {totals}
        </div>
      </div>
    );
  }
}

export default App;
