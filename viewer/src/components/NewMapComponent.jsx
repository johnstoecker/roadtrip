import React, { Component } from 'react';
import wagon from '../media/wagon.gif';
import wagon_single from '../media/wagon_single.png'

class NewMapComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isPlaying: false,
      mapName: "New Map"
    }
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    this.setState({mapName: event.target.value});
  }

  componentDidMount() {
  }

  render() {
    var wagon_src = wagon_single
    if(this.state.isPlaying) {
      wagon_src = wagon
    }

    return (
      <div className="App" tabIndex="0">
        <div className="App-header">
          <img src={wagon_src} className="App-logo" alt="logo" />
          {this.state.mapName}
          <img src={wagon_src} className="App-logo App-logo-second" alt="logo" />
        </div>
        <div className="map">
        <div className="map-name-input">
        Map Name:
        <input type="text"  value={this.state.mapName} onChange={this.handleChange}></input>
        <br/>
        Your map will be publicly accessible at:<br/>
        https://ironmaps.com/{this.state.mapName}
        </div>
        </div>
      </div>
    );
  }
}

export default NewMapComponent;
