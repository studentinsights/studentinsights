import React from 'react';
import PropTypes from 'prop-types';
import Datepicker from '../components/Datepicker';
import {toMoment} from '../helpers/toMoment';
import {merge} from '../helpers/merge';
import serviceColor from '../helpers/serviceColor';
import {recordServiceChoices} from '../helpers/PerDistrict';
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
        <div style={{ marginBottom: 5, display: 'inline' }}>
          Which service?
        </div>
        <div>
          {leftServiceTypeIds.concat(rightServiceTypeIds).map(this.renderServiceButton, this)}
        </div>
        {serviceTypeId && this.renderServiceInfo(serviceTypeId)}
      </div>
    );
  }

  renderServiceInfo(serviceTypeId) {
    const {serviceTypesIndex, servicesInfoDocUrl} = this.props;
    const service = serviceTypesIndex[serviceTypeId];
    if (!service) return null;
    if (!service.description && !service.data_owner) return null;


    return (
      <div style={styles.infoBox}>
        {service.description && <div>{service.description}</div>}
        {service.intensity && <div>{service.intensity}</div>}
        {service.data_owner && <div>Data owner: {service.data_owner}</div>}
        {servicesInfoDocUrl && (
          <div style={{marginTop: 15}}>
            See <a href={servicesInfoDocUrl} style={{fontSize: 12}} target="_blank" rel="noopener noreferrer">more</a>.
          </div>
        )}
      </div>
    );
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
        style={merge(styles.serviceButton, styles.buttonWidth, {
          background: color,
          outline: 0,
          border: (this.state.serviceTypeId === serviceTypeId)
            ? '4px solid rgba(49, 119, 201, 0.75)'
            : '4px solid white'
        })}>
        {serviceText}
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
      <div style={{ marginTop: 15 }}>
        <button
          style={{
            marginTop: 20,
            background: (isFormComplete) ? undefined : '#ccc'
          }}
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
  currentEducator: PropTypes.object.isRequired
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
    background: '#eee', // override CSS
    color: 'black'
  },
  buttonWidth: {
    width: '12em',
    fontSize: 12,
    padding: 8
  },
  infoBox: {
    fontSize: 12,
    padding: 15,
    background: 'rgba(3, 102, 214, 0.1)',
    border: '1px solid rgba(3, 102, 214, 0.1)'
  }
};
