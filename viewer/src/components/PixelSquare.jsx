import React, { Component } from 'react';
import onClickOutside from 'react-onclickoutside'
// import wagon from './media/wagon.png';
// import pixelUSA from './media/pixel_usa.svg'
// import pixelMap from './media/pixel_map.json'
// import tweets from './media/tweets.json'
// import tripTotals from "./media/totals.json"
// import './App.css';
// change for mobile?
const pixelScale = 12;

class PixelSquare extends Component {
    handleClick = () => {
      this.props.onPixelClick(this.props.pathPixelIndex, true, 0);
    }

    showNextTweet = () => {
      this.props.onNextTweetClick()
    }

    showPreviousTweet = () => {
      this.props.onPreviousTweetClick()
    }

    handleClickOutside = () => {
      this.props.closePixel(this.props.pathPixelIndex);
    }

    render() {
      // empty pixel if we are playing, and this pixel appears later
      if(this.props.isPlaying && this.props.pathPixelIndex>this.props.currentPathPixelIndex) {
        return (<div></div>)
      }

      const tweetBoxes = this.props.pathPixel.tweets.map((tweet, index) => {
        if (!tweet.visible) {
          return false
        }
        var imgBox;
        if (tweet["entities"] && tweet["entities"]["media"] && tweet["entities"]["media"].length>0) {
          // imgBox = (<div className="tweet-image"><div style={{backgroundImage: `url(${tweet["entities"]["media"][0]["media_url"]})`}}/></div>)
          imgBox = (<div className="tweet-image-container"><img className="tweet-image" src={tweet["entities"]["media"][0]["media_url"]}/></div>)
        }
        return (<div key={index} >
          <div className={"small-arrow " +((this.props.pathPixel.allTweets && this.props.currentInnerIndex>0) || 'hidden')} onClick={this.showPreviousTweet}>↑</div>
          <div className="tweet">{tweet["text"]}</div>
          {imgBox}
          <div className={"small-arrow " +((this.props.pathPixel.allTweets && this.props.currentInnerIndex<this.props.pathPixel.tweets.length-1) || 'hidden')} onClick={this.showNextTweet}>↓</div>
        </div>)
      });
      const displayName = this.props.pathPixel.tweets.map((tweet) =>
        (tweet.text.indexOf("You have discovered ") === 0) && <div className="location-label">{tweet["text"].substr("You have discovered ".length)}</div>
      );
      return (
        <div className="path-square-container">
          {displayName}
          <div className={"path-square hover-zoom " +(!this.props.pathPixel.visible || ' active') +(!this.props.pathPixel.current || ' current')} onClick={this.handleClick}></div>
          <div className={"tweet-box ignore-react-onclickoutside "+((this.props.pathPixel.visible && this.props.pathPixel.tweets.length>0) || 'hidden')}>
            {tweetBoxes}
          </div>
        </div>
      );
    }
}
export default onClickOutside(PixelSquare);
// export default PixelSquare;
