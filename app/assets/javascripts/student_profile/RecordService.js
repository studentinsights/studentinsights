import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Datepicker from '../components/Datepicker';
import Nbsp from '../components/Nbsp';
import {toMoment} from '../helpers/toMoment';
import {merge} from '../helpers/merge';
import serviceColor from '../helpers/serviceColor';
import {recordServiceChoices, showServicesInfo} from '../helpers/PerDistrict';
import {toSchoolYear, lastDayOfSchool} from '../helpers/schoolYear';
import ProvidedByEducatorDropdown from './ProvidedByEducatorDropdown';


/*
Pure UI form for recording that a student is receiving a service.
Tracks its own local state and submits values to prop callbacks.
*/
export default class RecordService extends React.Component {
  constructor(props) {
    super(props);
    
    const {nowMoment} = props;
    this.state = {
      serviceTypeId: null,
      providedByEducatorName: ''  ,
      dateStartedText: nowMoment.format('MM/DD/YYYY'),
      estimatedEndDateText: this.defaultEstimatedEndDate(nowMoment).format('MM/DD/YYYY')
    };

    this.onDateTextChanged = this.onDateTextChanged.bind(this);
    this.onEstimatedEndDateTextChanged = this.onEstimatedEndDateTextChanged.bind(this);
    this.onProvidedByEducatorTyping = this.onProvidedByEducatorTyping.bind(this);
    this.onProvidedByEducatorDropdownSelect = this.onProvidedByEducatorDropdownSelect.bind(this);
    this.onServiceClicked = this.onServiceClicked.bind(this);
    this.onClickCancel = this.onClickCancel.bind(this);
    this.onClickSave = this.onClickSave.bind(this);
  }

  // The default is to assume the service will last until the end of the school year.
  defaultEstimatedEndDate(nowMoment) {
    const schoolYear = toSchoolYear(nowMoment);
    return lastDayOfSchool(schoolYear);
  }

  // Normalize input date text into format Rails expects, tolerating empty string as null.
  // If the date is not valid, an error will be raised.
  formatDateTextForRails(dateText) {
    if (dateText === '') return null;
    const moment = toMoment(dateText);
    if (!moment.isValid()) throw new Error('invalid date: ' + dateText);
    return moment.format('YYYY-MM-DD');
  }

  isFormComplete() {
    const {serviceTypeId, providedByEducatorName} = this.state;
    if (serviceTypeId === null) return false;
    if (providedByEducatorName === '') return false;
    return true;
  }

  // Both dates need to be valid, but an empty end date is allowed.
  areDatesValid() {
    const {dateStartedText, estimatedEndDateText} = this.state;
    if (!toMoment(dateStartedText).isValid()) return false;
    if (estimatedEndDateText !== '' && !toMoment(estimatedEndDateText).isValid()) return false;
    return true;
  }

  onDateTextChanged(dateStartedText) {
    this.setState({dateStartedText});
  }

  onEstimatedEndDateTextChanged(estimatedEndDateText) {
    this.setState({estimatedEndDateText});
  }

  onProvidedByEducatorTyping(event) {
    this.setState({ providedByEducatorName: event.target.value });
  }

  onProvidedByEducatorDropdownSelect(string) {
    this.setState({ providedByEducatorName: string });
  }

  onServiceClicked(serviceTypeId, event) {
    this.setState({ serviceTypeId: serviceTypeId });
  }

  onClickCancel(event) {
    this.props.onCancel();
  }

  onClickSave(event) {
    const {currentEducator} = this.props;
    const {serviceTypeId, providedByEducatorName, dateStartedText, estimatedEndDateText} = this.state;
    if (!this.isFormComplete()) {
      console.error('onClickSave when form is not complete, aborting save...'); // eslint-disable-line no-console
      return;
    }

    this.props.onSave({
      serviceTypeId,
      providedByEducatorName,
      dateStartedText: this.formatDateTextForRails(dateStartedText),
      estimatedEndDateText: this.formatDateTextForRails(estimatedEndDateText),
      recordedByEducatorId: currentEducator.id
    });
  }

  render() {
    return (
      <div className="RecordService" style={styles.dialog}>
        {this.renderWhichService()}
        {this.renderWhoAndWhen()}
        {this.renderButtons()}
      </div>
    );
  }

  renderWhichService() {
    const {districtKey} = this.context;
    const {serviceTypeId} = this.state;
    const {leftServiceTypeIds, rightServiceTypeIds} = recordServiceChoices(districtKey);
    return (
      <div>
        <div style={{ marginBottom: 5, display: 'inline-block' }}>
          Which service?
        </div>
        <div style={{display: 'flex', flexDirection: 'row'}}>
          <div>
            {leftServiceTypeIds.map(this.renderServiceButton, this)}
          </div>
          <div>
            {rightServiceTypeIds.map(this.renderServiceButton, this)}
          </div>
        </div>
        <div className="RecordService-service-info-box">
          {this.renderServiceInfoBox(serviceTypeId)}
        </div>
      </div>
    );
  }
  
  renderServiceInfoBox(serviceTypeId) {
    const {districtKey} = this.context;
    const {currentEducator, serviceTypesIndex, servicesInfoDocUrl} = this.props;
    const isEnabled = (
      showServicesInfo(districtKey) ||
      (currentEducator.labels.indexOf('show_services_info') !== -1)
    );
    if (!isEnabled) return null;

    // nothing selected
    if (serviceTypeId === null) {
      return (
        <div style={{...styles.infoBox, opacity: 0.25}}>
          <div>Select a service for more description.</div>
          <div><Nbsp /></div>
          <div><Nbsp /></div>
          <div style={{marginTop: 5}}><Nbsp /></div>
        </div>
      );
    }

    // no service info
    const service = serviceTypesIndex[serviceTypeId];
    if (!service || (!service.description && !service.data_owner)) {
      return (
        <div style={{...styles.infoBox, opacity: 0.5}}>
          <div>No service info found.</div>
          <div><Nbsp /></div>
          <div><Nbsp /></div>
          <div style={{marginTop: 5}}><Nbsp /></div>
        </div>
      );
    }

    // show info
    return (
      <div style={styles.infoBox}>
        {service.description && <div>{service.description}</div>}
        {service.intensity && <div>{service.intensity}</div>}
        {service.data_owner && <div>Data owner: {service.data_owner}</div>}
        {servicesInfoDocUrl && (
          <div style={{marginTop: 5}}>
            <a href={servicesInfoDocUrl} style={{fontSize: 12}} target="_blank" rel="noopener noreferrer">Learn more</a>
          </div>
        )}
      </div>
    );
  }

  renderServiceInfoText(serviceTypeId) {
    const {serviceTypesIndex} = this.props;
    const service = serviceTypesIndex[serviceTypeId];
    return _.compact([
      service.name,
      service.description ? service.description : null,
      service.intensity ? service.intensity : null,
      service.data_owner ? `Data owner: ${service.data_owner}` : null
    ]).join("\n");
  }

  renderServiceButton(serviceTypeId) {
    const serviceText = this.props.serviceTypesIndex[serviceTypeId].name;
    const color = serviceColor(serviceTypeId);

    return (
      <button
        key={serviceTypeId}
        className={`btn service-type service-type-${serviceTypeId}`}
        onClick={this.onServiceClicked.bind(this, serviceTypeId)}
        tabIndex={-1}
        title={this.renderServiceInfoText(serviceTypeId)}
        style={merge(styles.serviceButton, {
          background: color,
          outline: 0,
          border: (this.state.serviceTypeId === serviceTypeId)
            ? '4px solid rgba(49, 119, 201, 0.75)'
            : '4px solid white'
        })}>
        <span style={styles.serviceButtonText}>{serviceText}</span>
      </button>
    );
  }

  renderEducatorSelect() {
    return (
      <ProvidedByEducatorDropdown
        onUserTyping={this.onProvidedByEducatorTyping}
        onUserDropdownSelect={this.onProvidedByEducatorDropdownSelect}
        studentId={this.props.studentId} />
    );
  }

  renderWhoAndWhen() {
    return (
      <div>
        <div style={{ marginTop: 20 }}>
          <div>
            {'Who is working with ' + this.props.studentFirstName + '?'}
          </div>
          <div>
            {this.renderEducatorSelect()}
          </div>
        </div>
        <div style={{ marginTop: 20 }}>
          When did they start?
        </div>
        <Datepicker
          styles={{
            datepicker: styles.datepicker,
            input: styles.datepickerInput
          }}
          value={this.state.dateStartedText}
          onChange={this.onDateTextChanged}
          datepickerOptions={{
            showOn: 'both',
            dateFormat: 'mm/dd/yy',
            minDate: undefined,
            maxDate: new Date
          }} />
        <div style={{ marginTop: 20 }}>
          When did/will they end?
        </div>
        <Datepicker
          styles={{
            datepicker: styles.datepicker,
            input: styles.datepickerInput
          }}
          value={this.state.estimatedEndDateText}
          onChange={this.onEstimatedEndDateTextChanged}
          datepickerOptions={{
            showOn: 'both',
            dateFormat: 'mm/dd/yy',
            minDate: undefined
          }} />
        <div style={{height: '2em'}}>
          {!this.areDatesValid() && <div className="RecordService-warning" style={styles.invalidDate}>Choose a valid date (end date is optional)</div>}
        </div>
      </div>
    );
  }

  renderButtons() {
    const isFormComplete = this.isFormComplete();

    return (
      <div style={{ marginTop: 20 }}>
        <button
          style={{background: (isFormComplete) ? undefined : '#ccc'}}
          disabled={!isFormComplete}
          className="btn save"
          onClick={this.onClickSave}>
          Record service
        </button>
        <button
          className="btn cancel"
          style={styles.cancelRecordServiceButton}
          onClick={this.onClickCancel}>
          Cancel
        </button>
        {(this.props.requestState === 'pending') ? <span>
          Saving...
        </span> : this.props.requestState}
      </div>
    );
  }
}
RecordService.contextTypes = {
  districtKey: PropTypes.string.isRequired
};
RecordService.propTypes = {
  studentFirstName: PropTypes.string.isRequired,
  studentId: PropTypes.number.isRequired,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  requestState: PropTypes.string, // or null

  // context
  nowMoment: PropTypes.object.isRequired,
  serviceTypesIndex: PropTypes.object.isRequired,
  educatorsIndex: PropTypes.object.isRequired,
  servicesInfoDocUrl: PropTypes.string,
  currentEducator: PropTypes.shape({
    id: PropTypes.number.isRequired,
    labels: PropTypes.arrayOf(PropTypes.string).isRequired
  }).isRequired
};

const styles = {
  dialog: {
    border: '1px solid #ccc',
    borderRadius: 2,
    padding: 20,
    marginBottom: 20,
    marginTop: 10
  },
  cancelRecordServiceButton: { // overidding CSS
    color: 'black',
    background: '#eee',
    marginLeft: 10,
    marginRight: 10
  },
  datepickerInput: {
    fontSize: 14,
    padding: 5,
    width: '50%'
  },
  invalidDate: {
    color: 'red',
    padding: 5
  },
  serviceButton: {
    fontSize: 12,
    background: '#eee', // override CSS
    color: 'black',
    width: '14em', // tuned for two columns, when page at max screen width
    height: 45,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8
  },
  serviceButtonText: {
    whiteSpace: 'nowrap',
    overflow: 'hidden', // in case overflow
  },
  infoBox: {
    margin: 10,
    fontSize: 12,
    padding: 10,
    background: 'rgba(3, 102, 214, 0.1)',
    border: '1px solid rgba(3, 102, 214, 0.1)'
  }
};
