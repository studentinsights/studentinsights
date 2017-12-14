import PropTypes from '../helpers/prop_types.jsx';
import HelpBubble from './help_bubble.js';

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
  window.shared.ServicesDetails = React.createClass({
    propTypes: {
      student: React.PropTypes.object.isRequired,
      serviceTypesIndex: React.PropTypes.object.isRequired,
      educatorsIndex: React.PropTypes.object.isRequired,
      currentEducator: React.PropTypes.object.isRequired,
      actions: PropTypes.actions.isRequired,
      feed: PropTypes.feed.isRequired,
      requests: PropTypes.requests.isRequired
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
          <div style={{borderBottom: '1px solid #333', padding: 10}}>
            <h4 style={{display: 'inline', color: 'black'}}>
              Services
            </h4>
            <HelpBubble
              title="What is a Service?"
              teaserText="(what is this?)"
              content={this.renderServicesHelpContent()} />
          </div>
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
