import React, { Component } from 'react';
import wagon from './media/wagon.gif';
import wagon_single from './media/wagon_single.png'
import pixelUSA from './media/pixel_usa.svg'
import pixelMap from './media/pixel_map.json'
// import tweets from './media/tweets.json'
import tripTotals from "./media/totals.json"
import PixelSquare from "./components/PixelSquare.jsx"
import $ from 'jquery';
import './App.css';
const randomMessages = ["[No messages found - the diary is a blank page]",
"[No messages found -- wagons keep rolling]",
"[No messages found -- too busy keeping oxen from falling into the river]",
"[No messages found -- food supplies low, currently drawing lots for who will get eaten]",
"[No messages found -- wagon drivers too busy chugging Red Bulls]",
"[No messages found -- the oxen let out plaintive cries on the asphalt]",
"[No messages found -- too busy doing donuts on the Interstate]",
"[No messages found -- engine horsepower upgrading to oxenpower]",
"[No messages found -- oxen distracted by squirrels and pull the wagon off-road]",
"[No messages found -- too busy bartering away gasoline for more oxen]",
"[No messages found -- drivers busy mixing up aux and ox cable]",
"[No messages found -- drivers busy doing squats with oxen and getting yoked]"]

// https://gist.github.com/andrei-m/982927
String.prototype.levenshtein = function(string) {
    var a = this, b = string + "", m = [], i, j, min = Math.min;

    if (!(a && b)) return (b || a).length;

    for (i = 0; i <= b.length; m[i] = [i++]);
    for (j = 0; j <= a.length; m[0][j] = j++);

    for (i = 1; i <= b.length; i++) {
        for (j = 1; j <= a.length; j++) {
            m[i][j] = b.charAt(i - 1) == a.charAt(j - 1)
                ? m[i - 1][j - 1]
                : m[i][j] = min(
                    m[i - 1][j - 1] + 1,
                    min(m[i][j - 1] + 1, m[i - 1 ][j] + 1))
        }
    }

    return m[b.length][a.length];
}



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
      days: 0,
      miles: 0,
      jokes: 0,
      questsAccepted: 0,
      questsCompleted: 0,
      quests: [],
      width: '0',
      height: '0',
      questIndex: 0
    }
    console.log("TODO: fix these warnings lol")
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
  // TODO: take out into a utils
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

  // TODO: take out into a utils
  deg2rad(deg) {
    return deg * (Math.PI/180)
  }

  getPathPixelIndexAt(pathPixels, x,y) {
    for(var i=0; i<pathPixels.length; i++) {
      if(pathPixels[i]["coords"][0] == x && pathPixels[i]["coords"][1] == y) {
        return i;
      }
    }
    return -1;
  }

  // TODO: take out into a utils
  drawLine(pathPixels, pixelIndex, pixelIndex2,previousTweet) {
    var newTweets = []
    var x_diff = pathPixels[pixelIndex]["coords"][0] - pathPixels[pixelIndex2]["coords"][0]
    var y_diff = pathPixels[pixelIndex]["coords"][1] - pathPixels[pixelIndex2]["coords"][1]
    var numPixels = Math.max(x_diff, y_diff)
    for(var i=0; i<numPixels; i++) {
      var x = Math.floor(x_diff*1.0*i/numPixels)+pathPixels[pixelIndex2]["coords"][0]
      var y = Math.floor(y_diff*1.0*i/numPixels)+pathPixels[pixelIndex2]["coords"][1]
      if(this.getPathPixelIndexAt(pathPixels, x,y)==-1) {
        var messageIndex = Math.floor(Math.random() * (randomMessages.length-1))
        var tweet = {
          text: randomMessages[messageIndex],
          pixel_coords: [x,y],
          visible: false,
          autoGen:true,
          miles: previousTweet.miles,
          created_at: previousTweet.created_at,
          day: previousTweet.day
        }
        newTweets.push(tweet)
        pathPixels.splice(pixelIndex2+i, 0, {
            "coords": [x,y],
            "tweets": [tweet],
            "visible": false
        })
      }
    }
    return {pathPixels: pathPixels, newTweets: newTweets}
  }

  // TODO: take out into a utils
  hasPath(pathPixels, pixelIndex, pixelIndex2, checkedIndices = []) {
    if(pixelIndex == pixelIndex2) {
      return true
    }

    checkedIndices.push(pixelIndex)
    for(var x = -1; x <=1; x++) {
      for(var y=-1; y<=1; y++) {
        var pathPixelIndex = this.getPathPixelIndexAt(pathPixels, pathPixels[pixelIndex]["coords"][0]+x,pathPixels[pixelIndex]["coords"][1]+y)
        // if a pixel exists neighboring, and we haven't checked it, check from there
        if(pathPixelIndex != -1 && !checkedIndices.includes(pathPixelIndex)){
          if(this.hasPath(pathPixels, pathPixelIndex, pixelIndex2)) {
            return true
          }
        }
      }
    }
    return false
  }

  getTweets() {
    // FML
    var that = this;
    $.getJSON('http://ironmaps.com:5001', function(data) {
      var tweets = data["tweets"];
      var miles=0,jokes=0,questsAccepted=0,questsCompleted = 0,previousMiles=0;
      var lastCoordinates = null
      var quests = []

      var pathPixelDetails = []
      for(var i=0; i< tweets.length; i++) {
          tweets[i].day = (Math.round(Math.abs(((new Date(tweets[i].created_at)).getTime() - (new Date(tweets[0].created_at)).getTime())/(24*60*60*1000))));
          tweets[i]["text"] = tweets[i]["text"].replace(/\shttps:\/\/t.co\/\S*/, "")
          if(tweets[i]["text"].toLowerCase().indexOf("quest accepted: ") != -1) {
            questsAccepted += 1;
            quests.push({text: tweets[i].text.slice("quest accepted: ".length), complete: false, acceptedIndex: i})
          }
          if(tweets[i]["text"].toLowerCase().indexOf("quest completed: ") != -1) {
            questsCompleted += 1;
            var text = tweets[i]["text"].slice("quest completed: ".length)
            for(var questInd=0; questInd< quests.length; questInd++) {
              // account for 3 typos in quests
              if(quests[questInd].text.levenshtein(text) < 3) {
                quests[questInd].complete = true
                quests[questInd].completedIndex = i
              }
            }
          }
          previousMiles = miles
          if(tweets[i]["coordinates"]){
            if(lastCoordinates != null) {
              miles+= that.getDistanceFromLonLat(lastCoordinates[0], lastCoordinates[1], tweets[i]["coordinates"]["coordinates"][0], tweets[i]["coordinates"]["coordinates"][1])
            }
            lastCoordinates = tweets[i]["coordinates"]["coordinates"]
          }
          tweets[i].miles = miles
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
              // check if there is a path between the last one and this one
              if(pathPixelDetails.length > 1 && !that.hasPath(pathPixelDetails, pathPixelDetails.length -1, pathPixelDetails.length-2)) {
                // if there is not, draw a path of blank squares
                var newState = that.drawLine(pathPixelDetails, pathPixelDetails.length -1,pathPixelDetails.length -2,tweets[i-1])
                pathPixelDetails = newState.pathPixels
                tweets = tweets.slice(0,i).concat(newState.newTweets).concat(tweets.slice(i))
                i+=newState.newTweets.length
              }
          }
      }
      for(var i=0; i<pathPixelDetails.length; i++) {
        if(tweets[tweets.length-1]["pixel_coords"] && pathPixelDetails[i]["coords"][0] == tweets[tweets.length-1]["pixel_coords"][0] && pathPixelDetails[i]["coords"][1] == tweets[tweets.length-1]["pixel_coords"][1]) {
          pathPixelDetails[i].current = true
        }
      }

      that.setState({pathPixelDetails: pathPixelDetails, tweets: tweets, miles: miles.toFixed(0), questsCompleted: questsCompleted, questsAccepted: questsAccepted, days: tweets[tweets.length-1].day, quests: quests});
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
    if(keyCode.keyCode == 37 || keyCode.keyCode == 38) {
      this.goToPrevious()
    } else if(keyCode.keyCode == 39 || keyCode.keyCode == 40) {
      this.goToNext()
    } else if(keyCode.keyCode == 32) {
      if (this.state.isPlaying) {
        this.pause()
      } else (
        this.play()
      )
    }
  }

  goToNextQuest() {
      if(this.state.questIndex < this.state.quests.length-1) {
        this.setState({questIndex: this.state.questIndex + 1})
      }
  }

  goToPreviousQuest() {
    if (this.state.questIndex > 0) {
      this.setState({questIndex: this.state.questIndex -1})
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

  // this one is different because we have the arrow...
  showNextTweetArrow() {
    var currentInnerIndex = this.state.currentInnerIndex+1
    var pathPixelDetails = this.state.pathPixelDetails
    for(var i=0; i< pathPixelDetails[this.state.currentPathIndex].tweets.length; i++) {
      pathPixelDetails[this.state.currentPathIndex].tweets[i].visible = false
    }
    pathPixelDetails[this.state.currentPathIndex].tweets[currentInnerIndex].visible = true
    this.setState({pathPixelDetails: pathPixelDetails, currentInnerIndex: currentInnerIndex})
  }

  // this one is different because we have the arrow...
  // can you please not share this code, ugh
  showPreviousTweetArrow() {
    var currentInnerIndex = this.state.currentInnerIndex-1
    var pathPixelDetails = this.state.pathPixelDetails
    for(var i=0; i< pathPixelDetails[this.state.currentPathIndex].tweets.length; i++) {
      pathPixelDetails[this.state.currentPathIndex].tweets[i].visible = false
    }
    pathPixelDetails[this.state.currentPathIndex].tweets[currentInnerIndex].visible = true
    this.setState({pathPixelDetails: pathPixelDetails, currentInnerIndex: currentInnerIndex})
  }


  // this parameter name is bad, yeah i know....
  // also function is too long...sometimes sacrifices must be made FOR THE GREATER GOOD (speed)
  showNext(reverse = false) {
    if(reverse) {
      var currentInnerIndex = this.state.currentInnerIndex - 1;
      var currentIndex = this.state.currentIndex - 1;
    } else {
      var currentInnerIndex = this.state.currentInnerIndex + 1;
      var currentIndex = this.state.currentIndex + 1;
    }
    var currentPathIndex = null

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
        currentIndex: -1
      })
      // TODO: maybe stop? or just show play button?
    }
  }

  clearTimeout = () => {
      window.clearTimeout(this.timeout);
  }

  closePixel(pathPixelIndex) {
    const pathPixelDetails = this.state.pathPixelDetails;
    pathPixelDetails[pathPixelIndex].visible = pathPixelDetails[pathPixelIndex].current = false;
    pathPixelDetails[pathPixelIndex].allTweets = false;
    this.setState({pathPixelDetails: pathPixelDetails})
  }

  showPixelSquare(pathPixelIndex, allTweets = true, currentInnerIndex = 0) {
    const pathPixelDetails = this.state.pathPixelDetails;
    for(var j=0; j<pathPixelDetails.length; j++) {
      pathPixelDetails[j].visible = pathPixelDetails[j].current = false
      pathPixelDetails[j].allTweets = false
    }
    for(var i=0; i< pathPixelDetails[pathPixelIndex].tweets.length; i++) {
      pathPixelDetails[pathPixelIndex].tweets[i].visible = false
    }
    pathPixelDetails[pathPixelIndex].tweets[currentInnerIndex].visible = true
    pathPixelDetails[pathPixelIndex].visible = pathPixelDetails[pathPixelIndex].current = !pathPixelDetails[pathPixelIndex].visible;
    pathPixelDetails[pathPixelIndex].allTweets = allTweets;
    this.setState({pathPixelDetails: pathPixelDetails, currentInnerIndex: currentInnerIndex, currentPathIndex: pathPixelIndex})
  }

  showQuests() {
    this.setState({showQuests: true})
  }

  hideQuests() {
    this.setState({showQuests: false})
  }

  render() {
    var miles = this.state.miles
    var day = this.state.days
    if(this.state.currentIndex != -1) {
      miles = this.state.pathPixelDetails[this.state.currentPathIndex].tweets[this.state.currentInnerIndex].miles.toFixed(0)
      day = this.state.pathPixelDetails[this.state.currentPathIndex].tweets[this.state.currentInnerIndex].day
    }

    const desktopQuests = this.state.quests.map((quest) => {
      var questCheckMark = (<div className="quest-mark incomplete-quest">□</div>)
      if(quest.complete) {
        questCheckMark = (<div className="quest-mark complete-quest">🙂</div>)
      }
      return (<div className="quest">
        {questCheckMark}
        {quest.text}
      </div>)
    })

    const mobileQuests = this.state.quests.map((quest,index) => {
      var questCheckMark = (<div className="quest-mark incomplete-quest">□</div>)
      if(quest.complete) {
        questCheckMark = (<div className="quest-mark complete-quest">🙂</div>)
      }
      return (<div className={"quest " +(this.state.questIndex == index || 'hidden')} >
        {questCheckMark}
        {quest.text}
      </div>)
    })

    const pathPixels = (this.state.pathPixelDetails || []).map((pathPixelDetail, index) => {
      // yes, yes, these should be constants.....
      // 12 -- normal window
      // 6 -- small window (phone)
      // 3 -- tiny (small phone)
      var leftPos = (pathPixelDetail["coords"][0]+1)*(14)
      var topPos = pathPixelDetail["coords"][1]*(14)-1
      if(this.state.width <= 525) {
        var leftPos = Math.floor((pathPixelDetail["coords"][0]+2)*(3.5))-4
        var topPos = Math.floor(pathPixelDetail["coords"][1]*(3.5))
      } else if (this.state.width <= 1050) {
        var leftPos = (pathPixelDetail["coords"][0]+1)*(7)
        var topPos = (pathPixelDetail["coords"][1])*(7)
      }
      return (<div className="path-pixel" style={{position: 'absolute', left: leftPos, top:topPos}}>
          <PixelSquare pathPixelIndex={index} currentInnerIndex={this.state.currentInnerIndex} pathPixel={pathPixelDetail} closePixel={(event) => { this.closePixel(event) }} onPixelClick={(event) => { this.showPixelSquare(event) }} onNextTweetClick={(event) => {this.showNextTweetArrow(event)}} onPreviousTweetClick={(event) => {this.showPreviousTweetArrow(event)}}/>
      </div>)
    }

    );
    const totals = (
        <div className="legend">
            <div className="legend-label-container">
              <div className="legend-labels">
                  <div className="legend-label">Days</div>
                  <div className="legend-label">Miles</div>
                  <div className="legend-label">Quests</div>
              </div>
              <div className="legend-values">
                  <div className="legend-value">{day}</div>
                  <div className="legend-value">{miles}</div>
                  <div className="legend-value">{this.state.questsCompleted+'/'+this.state.questsAccepted}</div>
              </div>
            </div>
            <div className="desktop-only">
              {desktopQuests}
            </div>
            <div className="mobile-only">
              {mobileQuests}
              <div className="navigation navigation-small ignore-react-onclickoutside">
                <div className="navigator navigate-left" onClick={this.goToPreviousQuest.bind(this)}>←</div>
                <div className="navigator navigate-right"onClick={this.goToNextQuest.bind(this)}>→</div>
              </div>
            </div>
        </div>
    )

    const navigation = (
      <div className="navigation ignore-react-onclickoutside">
        <div className="navigator navigate-left" onClick={this.goToPrevious.bind(this)}>←</div>
        <div className={"navigator navigate-play rotate-me " + (this.state.isPlaying && 'hidden')} onClick={this.play.bind(this)}>▲</div>
        <div className={"navigator navigate-pause rotate-me " +(this.state.isPlaying || 'hidden')} onClick={this.pause.bind(this)}>△</div>
        <div className="navigator navigate-right"onClick={this.goToNext.bind(this)}>→</div>
      </div>
    )
    var wagon_src = wagon_single
    if(this.state.isPlaying) {
      wagon_src = wagon
    }

    return (
      <div className="App" onKeyDown={(e) => this.onKeyDown(e)} tabIndex="0">
        <div className="App-header">
          <img src={wagon_src} className="App-logo" alt="logo" />
          Iron Maps
          <img src={wagon_src} className="App-logo App-logo-second" alt="logo" />
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
