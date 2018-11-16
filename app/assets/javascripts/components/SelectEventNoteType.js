import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import SimpleFilterSelect, {ALL} from './SimpleFilterSelect';
import {eventNoteTypeText} from '../helpers/eventNoteType';
import {eventNoteTypeIdsForSearch} from '../helpers/PerDistrict';


// For selecting a single event note type by id
export default class SelectEventNoteType extends React.Component {
  render() {
    const {eventNoteTypeId, onChange, eventNoteTypeIds, style} = this.props;
    const {districtKey} = this.context;
    const sortedEventNoteTypeIds = _.sortBy(eventNoteTypeIds || eventNoteTypeIdsForSearch(districtKey));
    const noteTypeOptions = [{value: ALL, label: 'All'}].concat(sortedEventNoteTypeIds.map(eventNoteTypeId => {
      return { value: eventNoteTypeId.toString(), label: eventNoteTypeText(eventNoteTypeId) };
    }));
    return (
      <SimpleFilterSelect
        style={style}
        placeholder="Note type..."
        value={eventNoteTypeId}
        onChange={onChange}
        options={noteTypeOptions} />
    );
  }
}
SelectEventNoteType.contextTypes = {
  districtKey: PropTypes.string.isRequired
};
SelectEventNoteType.propTypes = {
  eventNoteTypeId: PropTypes.any.isRequired, // number, but magic ALL string also
  onChange: PropTypes.func.isRequired,
  eventNoteTypeIds: PropTypes.arrayOf(PropTypes.number),
  style: PropTypes.object
};