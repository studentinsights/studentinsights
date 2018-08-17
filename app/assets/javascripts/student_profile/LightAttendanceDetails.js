import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import ProfileBarChart, {
  tooltipEventTextFn,
  createUnsafeTooltipFormatter,
  servicePhaselines
} from './ProfileBarChart';


export default class LightAttendanceDetails extends React.Component {
  phaselines() {
    const {activeServices, serviceTypesIndex} = this.props;
    return servicePhaselines(activeServices, serviceTypesIndex);
  }

  render() {
    return (
      <div className="LightAttendanceDetails">
        {this.renderAbsences()}
        {this.renderTardies()}
      </div>
    );
  }

  renderAbsences() {
    return (
      <ProfileBarChart
        events={this.props.absences}
        id="absences"
        titleText="Absences"
        monthsBack={48}
        phaselines={this.phaselines()}
        seriesFn={absenceSeriesFn}
        tooltipFn={absenceTooltipFn}
        />
    );
  }

  renderTardies() {
    return (
      <ProfileBarChart
        events={this.props.tardies}
        id="tardies"
        titleText="Tardies"
        monthsBack={48}
        phaselines={this.phaselines()} />
    );
  }
}

LightAttendanceDetails.propTypes = {
  absences: PropTypes.array.isRequired,
  tardies: PropTypes.array.isRequired,
  activeServices: PropTypes.arrayOf(PropTypes.shape({
    service_type_id: PropTypes.number.isRequired,
    date_started: PropTypes.string.isRequired
  })).isRequired,
  serviceTypesIndex: PropTypes.object.isRequired
};


function absenceSeriesFn(monthBuckets) {
  return [{
    name: 'Excused',
    color: '#ccc',
    showInLegend: true,
    data: _.map(monthBuckets, es => es.filter(e => e.excused).length)
  },
  {
    name: 'Unexcused absences',
    color: '#7cb5ec',
    showInLegend: true,
    data: _.map(monthBuckets, es => es.filter(e => !e.excused).length)
  }];
}


function absenceTooltipFn(monthBuckets) {
  return {
    formatter: createUnsafeTooltipFormatter(monthBuckets, tooltipTextFn),
    useHTML: true
  };
}

function tooltipTextFn(e) {
  const date = tooltipEventTextFn(e);
  const explanation = absenceExplanationText(e);
  return `${date}${explanation}`;
}

function absenceExplanationText(absence) {
  if (absence.excused && absence.reason && absence.comment) {
    return ` (Excused, ${absence.reason}, ${absence.comment})`;
  } else if (absence.excused && absence.reason) {
    return ` (Excused, ${absence.reason})`;
  } else if (absence.excused) {
    return ` (Excused)`;
  } else if (absence.reason) {
    return ` (${absence.reason})`;
  } else if (absence.comment) {
    return ` (${absence.comment})`;
  }

  return '';
}
