/* global window */
import React, {Component} from 'react';
import {render} from 'react-dom';
import {StaticMap} from 'react-map-gl';
import {AmbientLight, PointLight, LightingEffect} from '@deck.gl/core';
import DeckGL from '@deck.gl/react';
import {PolygonLayer} from '@deck.gl/layers';
import {TripsLayer} from '@deck.gl/geo-layers';

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

// Source data CSV
const DATA_URL = {
  BUILDINGS:
    'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/trips/buildings.json', // eslint-disable-line
  TRIPS:
    // 'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/trips/trips-v7.json'
    './data.json' // eslint-disable-line
};

const ambientLight = new AmbientLight({
  color: [255, 255, 255],
  intensity: 3.0
});

const pointLight = new PointLight({
  color: [255, 255, 255],
  intensity: 3.0,
  position: [-74.05, 40.7, 8000]
});

const lightingEffect = new LightingEffect({ambientLight, pointLight});

const material = {
  ambient: 0.1,
  diffuse: 0.6,
  shininess: 50,
  specularColor: [60, 64, 70]
};

const DEFAULT_THEME = {
  buildingColor: [74, 80, 87],
  trailColor0: [253, 128, 93],
  trailColor1: [23, 184, 190],
  material,
  effects: [lightingEffect]
};

const INITIAL_VIEW_STATE = {
  longitude: 123.8,
  latitude: 24.5139936,
  zoom: 8,
  pitch: 45,
  bearing: 0
};

const landCover = [[[127, 26], [129, 26], [129, 26], [127, 28]]];

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      time: 0
    };
  }

  componentDidMount() {
    this._animate();
  }

  componentWillUnmount() {
    if (this._animationFrame) {
      window.cancelAnimationFrame(this._animationFrame);
    }
  }

  _animate() {
    const {
      loopLength = 1200, // unit corresponds to the timestamp in source data
      animationSpeed = 150 // unit time per second
    } = this.props;
    const timestamp = Date.now() / 1000;
    const loopTime = loopLength / animationSpeed;

    this.setState({
      time: ((timestamp % loopTime) / loopTime) * loopLength
    });
    this._animationFrame = window.requestAnimationFrame(this._animate.bind(this));
  }

  _renderLayers() {
    const {
      buildings = DATA_URL.BUILDINGS,
      trips = DATA_URL.TRIPS,
      trailLength = 100,
      theme = DEFAULT_THEME
    } = this.props;

    return [
      // This is only needed when using shadow effects
      new PolygonLayer({
        id: 'ground',
        data: landCover,
        getPolygon: f => f,
        stroked: false,
        getFillColor: [0, 0, 0, 0]
      }),
      new TripsLayer({
        id: 'trips',
        data: trips,
        getPath: d => d.path,
        getTimestamps: d => d.timestamps,
        getColor: d => (d.vendor === 0 ? theme.trailColor0 : theme.trailColor1),
        opacity: 0.7,
        widthMinPixels: 10,
        rounded: true,
        trailLength,
        currentTime: this.state.time,

        shadowEnabled: false
      }),
      // new PolygonLayer({
      //   id: 'buildings',
      //   data: buildings,
      //   extruded: true,
      //   wireframe: false,
      //   opacity: 0.5,
      //   getPolygon: f => f.polygon,
      //   getElevation: f => f.height,
      //   getFillColor: theme.buildingColor,
      //   material: theme.material
      // })
    ];
  }

  render() {
    const {
      viewState,
      mapStyle = 'mapbox://styles/hiracky16/ck6ynhdn014791in75kiebgvr',
      theme = DEFAULT_THEME
    } = this.props;

    return (
      <DeckGL
        layers={this._renderLayers()}
        effects={theme.effects}
        initialViewState={INITIAL_VIEW_STATE}
        viewState={viewState}
        controller={true}
      >
        <StaticMap
          reuseMaps
          mapStyle={mapStyle}
          preventStyleDiffing={true}
          mapboxApiAccessToken={process.env.MapboxAccessToken}
        />
      </DeckGL>
    );
  }
}

render(<App />, document.getElementById('app'));
