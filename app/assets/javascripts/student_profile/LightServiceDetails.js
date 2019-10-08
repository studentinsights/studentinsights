import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import * as InsightsPropTypes from '../helpers/InsightsPropTypes';
import SectionHeading from '../components/SectionHeading';
import LightHelpBubble from './LightHelpBubble';
import ServicesList from './ServicesList';
import RecordService from './RecordService';

/*
The bottom region of the page, showing notes about the student, services
they are receiving, and allowing users to enter new information about
these as well.
*/
export default class ServiceDetails extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isAddingService: false
    };

    this.onClickRecordService = this.onClickRecordService.bind(this);
    this.onCancelRecordService = this.onCancelRecordService.bind(this);
    this.onClickSaveService = this.onClickSaveService.bind(this);
    this.onClickDiscontinueService = this.onClickDiscontinueService.bind(this);
  }

  isAddingService() {
    return (this.state.isAddingService || this.props.requests.saveService !== null);
  }

  onClickRecordService(event) {
    this.setState({ isAddingService: true });
  }

  onCancelRecordService(event) {
    this.setState({ isAddingService: false });
  }

  onClickSaveService(serviceParams, event) {
    this.props.actions.onSaveService(serviceParams);
    this.setState({ isAddingService: false });
  }

  onClickDiscontinueService(serviceId, event) {
    this.props.actions.onDiscontinueService(serviceId);
  }

  render() {
    return (
      <div className="ServicesDetails" style={styles.servicesContainer}>
        <SectionHeading titleStyle={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <div style={{display: 'flex', alignItems: 'center', padding: 2}}>
            <span>Services</span>
            <LightHelpBubble
              title="What is a Service?"
              content={this.renderServicesHelpContent()} />
          </div>
          {!this.isAddingService() && this.renderAddServiceButton()}
        </SectionHeading>
        <div>
          {this.isAddingService() && this.renderAddServiceDialog()}
          <ServicesList
            servicesFeed={this.props.feed.services}
            educatorsIndex={this.props.educatorsIndex}
            serviceTypesIndex={this.props.serviceTypesIndex}
            servicesInfoDocUrl={this.props.servicesInfoDocUrl}
            onClickDiscontinueService={this.onClickDiscontinueService}
            discontinueServiceRequests={this.props.requests.discontinueService} />
        </div>
      </div>
    );
  }

  renderServicesHelpContent(){
    const {servicesInfoDocUrl} = this.props;
    return (
      <div>
        <p>
          Services are a place to keep track of more formal interventions for a student. It includes a specific person responsible and dates.  If {`you're`} not sure whether to use a Service or a Note, write a Note.  You can always search back through notes later.
        </p>
        {servicesInfoDocUrl && <p style={{marginTop: 20}}>
          <a style={{fontWeight: 'bold'}} href={servicesInfoDocUrl} target="_blank" rel="noopener noreferrer">Learn more</a> about specific services within your district.
        </p>}
      </div>
    );
  }

  renderAddServiceDialog() {
    return (
      <RecordService
        studentFirstName={this.props.student.first_name}
        studentId={this.props.student.id}
        onSave={this.onClickSaveService}
        onCancel={this.onCancelRecordService}
        requestState={this.props.requests.saveService}
        // TODO(kr) thread through
        nowMoment={moment.utc()}
        currentEducator={this.props.currentEducator}
        serviceTypesIndex={this.props.serviceTypesIndex}
        servicesInfoDocUrl={this.props.servicesInfoDocUrl}
        educatorsIndex={this.props.educatorsIndex} />
    );
  }

  renderAddServiceButton() {
    return (
      <button className="btn record-service" style={{margin: 0}} onClick={this.onClickRecordService}>
        <span><span style={{fontWeight: 'bold', paddingRight: 5}}>+</span><span>service</span></span>
      </button>
    );
  }
}
ServiceDetails.propTypes = {
  student: PropTypes.object.isRequired,
  serviceTypesIndex: PropTypes.object.isRequired,
  servicesInfoDocUrl: PropTypes.string,
  educatorsIndex: PropTypes.object.isRequired,
  currentEducator: PropTypes.object.isRequired,
  actions: InsightsPropTypes.actions.isRequired,
  feed: InsightsPropTypes.feed.isRequired,
  requests: InsightsPropTypes.requests.isRequired
};

const styles = {
  servicesContainer: {
    flex: 1
  },
  addServiceContainer: {
    marginTop: 10
  }
};
