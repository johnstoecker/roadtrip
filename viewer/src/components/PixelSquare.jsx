import React, { Component } from 'react';
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

    render() {
      console.log(this.props.pathPixel.visible)
      const tweetBoxes = this.props.pathPixel.tweets.map((tweet, index) =>
        <div className="tweet">{tweet["text"]}</div>
      );
      return (
        <div className="path-square hover-zoom" onClick={this.handleClick}>
          <div className={"tweet-box "+(this.props.pathPixel.visible || 'hidden')}>
            {this.props.pathPixel.tweets[0]["text"]}
          </div>
        </div>
      );
    }
}
export default PixelSquare;
