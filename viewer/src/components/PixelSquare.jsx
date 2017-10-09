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
      // this.props.pathPixel.visible = !this.props.pathPixel.visible;
      // console.log(this.props.pathPixel.visible || 'hidden')
      this.props.onPixelClick(this.props.pathPixelIndex);
    }

    handleClickOutside = () => {
      this.props.closePixel(this.props.pathPixelIndex);
    }

    render() {
      const tweetBoxes = this.props.pathPixel.tweets.map((tweet, index) => {
        if (!tweet.visible) {
          return false
        }
        var imgBox;
        if (tweet["entities"] && tweet["entities"]["media"] && tweet["entities"]["media"].length>0) {
          console.log(tweet["entities"]["media"][0])
          // imgBox = (<div className="tweet-image"><div style={{backgroundImage: `url(${tweet["entities"]["media"][0]["media_url"]})`}}/></div>)
          imgBox = (<div className="tweet-image-container"><img className="tweet-image" src={tweet["entities"]["media"][0]["media_url"]}/></div>)
        }
        return (<div key={index} >
          <div className="tweet">{tweet["text"]}</div>
          {imgBox}
        </div>)
      });
      const displayName = this.props.pathPixel.tweets.map((tweet) =>
        (tweet.text.indexOf("You have discovered ") === 0) && <div className="location-label">{tweet["text"].substr("You have discovered ".length)}</div>
      );
      return (
        <div className={"path-square hover-zoom " +(!this.props.pathPixel.visible || 'active')} onClick={this.handleClick}>
          <div className={"tweet-box "+(this.props.pathPixel.visible || 'hidden')}>
            {tweetBoxes}
          </div>
          {displayName}
        </div>
      );
    }
}
export default onClickOutside(PixelSquare);
// export default PixelSquare;
