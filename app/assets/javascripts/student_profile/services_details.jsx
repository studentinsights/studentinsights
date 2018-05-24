import React from 'react';
import createClass from 'create-react-class';
import PropTypes from 'prop-types';
import * as InsightsPropTypes from '../helpers/InsightsPropTypes';
import HelpBubble from '../components/HelpBubble';
import SectionHeading from '../components/SectionHeading';

(function() {
  window.shared || (window.shared = {});

  const ServicesList = window.shared.ServicesList;
  const RecordService = window.shared.RecordService;

  const styles = {
    servicesContainer: {
      flex: 1
    },
    addServiceContainer: {
      marginTop: 10
    }
  };

  /*
  The bottom region of the page, showing notes about the student, services
  they are receiving, and allowing users to enter new information about
  these as well.
  */
  window.shared.ServicesDetails = createClass({
    propTypes: {
      student: PropTypes.object.isRequired,
      serviceTypesIndex: PropTypes.object.isRequired,
      educatorsIndex: PropTypes.object.isRequired,
      currentEducator: PropTypes.object.isRequired,
      actions: InsightsPropTypes.actions.isRequired,
      feed: InsightsPropTypes.feed.isRequired,
      requests: InsightsPropTypes.requests.isRequired
    },

    getInitialState: function() {
      return {
        isAddingService: false
      };
    },

    onClickRecordService: function(event) {
      this.setState({ isAddingService: true });
    },

    onCancelRecordService: function(event) {
      this.setState({ isAddingService: false });
    },

    onClickSaveService: function(serviceParams, event) {
      this.props.actions.onClickSaveService(serviceParams);
      this.setState({ isAddingService: false });
    },

    onClickDiscontinueService: function(serviceId, event) {
      this.props.actions.onClickDiscontinueService(serviceId);
    },

    render: function() {
      return (
        <div className="ServicesDetails" style={styles.servicesContainer}>
          <SectionHeading>
            <span>Services</span>
            <HelpBubble
              teaser="(what is this?)"
              title="What is a Service?"
              content={this.renderServicesHelpContent()} />
          </SectionHeading>
          <div style={styles.addServiceContainer}>
            {this.renderRecordServiceSection()}
          </div>
          <ServicesList
            servicesFeed={this.props.feed.services}
            educatorsIndex={this.props.educatorsIndex}
            serviceTypesIndex={this.props.serviceTypesIndex}
            onClickDiscontinueService={this.onClickDiscontinueService}
            discontinueServiceRequests={this.props.requests.discontinueService} />
        </div>
      );
    },

    renderServicesHelpContent: function(){
      return (
        <div>
          <p>
            While Notes are a catch-all for student information, Services are a place to keep track of more formal         extensive interventions for a student. It includes a specific person responsible and dates.
          </p>
          <br />
          <p>
            The types of Services are:
          </p>
          <ul>
            <li>
              <b>
                {'Attendance Officer: '}
              </b>
              This usually includes home visit(s), regular follow-up,           and could later on lead to a formal attendance contract.
            </li>
            <li>
              <b>
                {'Attendance Contract: '}
              </b>
              This is usually done in cooperation with the attendance officer,           school adjustment counselor, and/or principal. This is a more formal document that requires a parent and           student signature, along with regular checkpoints.
            </li>
            <li>
              <b>
                {'Behavior Contract: '}
              </b>
              This is usually done in cooperation with the attendance officer,           school adjustment counselor, and/or principal. This is a more formal document that requires a parent and           student signature, along with regular checkpoints.
            </li>
            <li>
              <b>
                {'Counseling, in-house: '}
              </b>
              Student receives regular weekly or bi-weekly counseling from an SPS counselor.           One time or infrequent check-ins by a counselor should just be recorded in Notes.
            </li>
            <li>
              <b>
                {'Counseling, outside: '}
              </b>
              Student receives regular weekly or bi-weekly counseling from an outside           counselor, ex. Riverside, Home for Little Wanderers. One time or infrequent check-ins by a counselor should           just be recorded in Notes.
            </li>
            <li>
              <b>
                {'Reading Intervention: '}
              </b>
              Student works with a reading specialist at least 4x/week for 30-40 minutes.
            </li>
          </ul>
          <br />
          <p>
            If your data fits into one of these categories, it's a Service. Otherwise, it's a Note.
          </p>
        </div>
      );
    },

    renderRecordServiceSection: function() {
      if (this.state.isAddingService || this.props.requests.saveService !== null) {
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
            educatorsIndex={this.props.educatorsIndex} />
        );
      }

      return (
        <button className="btn record-service" onClick={this.onClickRecordService}>
          Record service
        </button>
      );
    }
  });
})();
