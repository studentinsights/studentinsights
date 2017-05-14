import L from 'leaflet';
const $ = window.$;

// from http://colorbrewer2.org/#type=diverging&scheme=Spectral&n=10
const palette = ['#9e0142','#d53e4f','#f46d43','#fdae61','#fee08b','#e6f598','#abdda4','#66c2a5','#3288bd','#5e4fa2'];
const orderedSchoolColors = [
  { id: 11, color: palette[0] },
  { id: 4, color: palette[1] },
  { id: 2, color: palette[2] },
  { id: 6, color: palette[3] },
  { id: 7, color: palette[7] },
  { id: 3, color: palette[8] },
  { id: 5, color: palette[9] },
  { id: 8, color: palette[4] },
  { id: 10, color: palette[6] },
  { id: 9, color: palette[5] }
];
const schoolColors = orderedSchoolColors.reduce((map, school) => {
  map[school.id] = school.color;
  return map;
}, {});


export default React.createClass({
  displayName: 'PlacesPage',

  getInitialState() {
    return {
      selectedSchoolId: null
    };
  },

  componentWillMount() {
    // compute a one-time index
    const {plots} = this.props;
    this.plotsBySchool = _.groupBy(plots, 'school_id');
  },

  componentDidMount() {
    // add map
    // const {plots} = this.props;
    // const {coords} = plots[0].geo;
    const coords = [42.3950, -71.0995];
    const accessToken = 'pk.eyJ1Ijoia2V2aW5yb2JpbnNvbiIsImEiOiJjajJuc2lwdmowMjB1MndzM2kzZ3E5MTVyIn0.uZn4gI81spMKTEk0kxxjEQ';
    this.map = this.createMap(accessToken, coords);

    // update markers
    const {selectedSchoolId} = this.state;
    this.markers = [];
    this.updateMarkers(selectedSchoolId);
  },

  componentDidUpdate(prevProps, prevState) {
    const {selectedSchoolId} = this.state;
    if (prevState.selectedSchoolId !== selectedSchoolId) {
      this.updateMarkers(selectedSchoolId);
    }
  },

  // injects stylesheet too
  createMap(accessToken, coords) {
    $('head').append('<link rel="stylesheet" href="https://unpkg.com/leaflet@1.0.3/dist/leaflet.css" integrity="sha512-07I2e+7D8p6he1SIM+1twR5TIrhUQn9+I6yjqD53JQjFiMf8EtC93ty0/5vJTZGF8aAocvHYNEDJajGdNx1IsQ==" crossorigin="" />');

    const options = {
      minZoom: 12,
      maxZoom: 17,
      zoomSnap: 0.5,
      renderer: L.canvas()
    };
    const map = L.map(this.el, options).setView(coords, 13.75);
    L.tileLayer(`https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=${accessToken}`, {
      maxZoom: 18,
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
        '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="http://mapbox.com">Mapbox</a>',
      id: 'mapbox.streets'
    }).addTo(map);

    return map;
  },

  circleStyle(schoolId) {
    const color = schoolColors[schoolId];
    return {
      weight: 0,
      color: color,
      fillColor: color,
      fillOpacity: 0.3,
      radius: 100
    }
  },

  updateMarkers(selectedSchoolId) {
    const map = this.map;
    const {plots} = this.props;
    this.markers.forEach(marker => map.removeLayer(marker));
    this.markers = _.compact(plots.map(plot => {
      const {geo} = plot;
      if (!geo) return null;

      const schoolId = plot.school_id;
      if (selectedSchoolId && schoolId !== selectedSchoolId) return null;

      return L.circle(geo.coords, this.circleStyle(schoolId));
    }));
    this.markers.forEach(marker => marker.addTo(map));
  },

  onSchoolClicked(schoolId) {
    const selectedSchoolId = (schoolId === this.state.selectedSchoolId)
      ? null
      : schoolId;
    this.setState({selectedSchoolId});
  },

  render() {
    const {plots, schools} = this.props;
    const orderedSchools = _.sortBy(schools, school => _.findIndex(orderedSchoolColors, { id: school.id }));
    return (
      <div>
        <div style={{display: 'flex'}}>{orderedSchools.map((school) => {
          return this.renderButton(school.name, school.id);
        })}</div>
        <div style={{width: '100%', height: 600}}>
          <div
            style={{height: '100%'}}
            ref={(el) => this.el = el} />
        </div>
      </div>
    );
  },

  renderButton(text, schoolId) {
    const {selectedSchoolId} = this.state;
    const count = (this.plotsBySchool[schoolId] || []).length;
    // if (count === 0) return;

    const color = schoolColors[schoolId];
    const borderColor = (schoolId === selectedSchoolId)
      ? '#3177c9'
      : color;
    return <a
      key={schoolId}
      onClick={this.onSchoolClicked.bind(this, schoolId)}
      style={{
        padding: 8,
        fontSize: 12,
        cursor: 'pointer',
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        borderTop: `3px solid ${borderColor}`,
        borderBottom: `3px solid ${borderColor}`,
        backgroundColor: color,
        color: (schoolId === selectedSchoolId)
          ? 'white'
          : 'black'
      }}>{text} ({count})</a>;
  }
});