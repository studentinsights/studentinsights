import React from 'react';
import {merge} from '../helpers/merge';
import {toMomentFromRailsDate} from '../helpers/toMomentFromRailsDate.js';
import * as Theme from '../helpers/Theme';


class ServiceUploadDetail extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      showStudentLinks: false,
      showDeletionConfirmation: false,
    };

    this.toggleDeletionConfirmation = this.toggleDeletionConfirmation.bind(this);
    this.toggleShowStudents = this.toggleShowStudents.bind(this);
  }

  toggleDeletionConfirmation() {
    this.setState({ showDeletionConfirmation: !this.state.showDeletionConfirmation });
  }

  toggleShowStudents() {
    this.setState({ showStudentLinks: !(this.state.showStudentLinks) });
  }

  dataCellStyle() {
    return {
      width: '100%',
      borderBottom: '1px solid #999',
      borderLeft: '1px solid #999',
      padding: 30,
    };
  }

  render() {
    const {data} = this.props;
    const createdAtMoment = toMomentFromRailsDate(data.created_at);

    return (
      <div key={String(data.id)} style={this.dataCellStyle()}>
        <div style={{ marginBottom: 18 }}>
          <span style={{ fontSize: 22 }}>
            {data.file_name}
          </span>
          <span style={{ fontSize: 13, color: '#999', marginLeft: 15 }}>
            {'Uploaded ' + createdAtMoment.format('M/D/YYYY')}
          </span>
        </div>
        {this.renderServiceTypeName()}
        <div>
          <span style={{ color: '#333' }}>
            {String(data.services.length) + ' students'}
          </span>
          {this.renderShowStudentsLink()}
          {this.renderDeletionArea()}
        </div>
        {this.renderStudentLinks()}
      </div>
    );
  }

  renderShowStudentsLink() {
    if (this.props.data.services.length === 0) return;

    return (
      <span>
        {this.renderInfoSeparator()}
        <a style={Theme.styles.link} onClick={this.toggleShowStudents}>
          {this.state.showStudentLinks ? 'Hide students' : 'Show students'}
        </a>
      </span>
    );
  }

  renderServiceTypeName() {
    const service = this.props.data.services[0];

    if (!service) return;

    return (
      <div style={{ marginBottom: 18, fontSize: 18, color: '#555' }}>
        {service.service_type.name}
      </div>
    );
  }

  renderDeletionArea() {
    if (this.state.showDeletionConfirmation) {
      const numberOfServices = this.props.data.services.length;
      const numberOfServicesText = `Are you suure you want to delete this upload and its ${numberOfServices} services?`;

      return (
        <div>
          <br />
          <p>{numberOfServicesText}</p>
          <br />
          <button
            className="btn btn-warning"
            onClick={this.props.onClickDeleteServiceUpload.bind(null, this.props.data.id)}>
            Yes, confirm deletion.
          </button>
          <button
            className="btn"
            onClick={this.toggleDeletionConfirmation}
            style={{ marginLeft: 10 }}>
            Cancel deletion.
          </button>
        </div>
      );
    } else {
      return (
        <span>
          {this.renderInfoSeparator()}
          <a
            style={merge(Theme.styles.link, {
              color: 'red', fontSize: 15
            })}
            onClick={this.toggleDeletionConfirmation}>
            Delete
          </a>
        </span>
      );
    }
  }

  renderStudentLinks() {
    const {showStudentLinks} = this.state;
    if (!showStudentLinks) return null;

    const {data} = this.props;
    const students = data.services.map((service) => { return service.student; });

    const studentLinks = students.map((student) => {
      return (
        <div
          key={data.file_name + ' ' + student.id}
          style={{
            marginLeft: 15
          }}>
          <li>
            <a href={'/students/' + student.id} style={Theme.styles.link}>
              {[student.first_name, student.last_name].join(' ')}
            </a>
          </li>
        </div>
      );
    }, this);

    return (
      <div>
        <br />
        {studentLinks}
      </div>
    );
  }

  renderInfoSeparator() {
    return (
      <span>
        {' | '}
      </span>
    );
  }

}

ServiceUploadDetail.propTypes = {
  data: React.PropTypes.shape({
    id: React.PropTypes.number.isRequired,
    file_name: React.PropTypes.string.isRequired,
    created_at: React.PropTypes.string.isRequired,
    services: React.PropTypes.arrayOf(
      React.PropTypes.shape({
        service_type: React.PropTypes.shape({
          name: React.PropTypes.string.isRequired,
        }).isRequired,
        student: React.PropTypes.shape({
          id: React.PropTypes.number.isRequired,
          first_name: React.PropTypes.string.isRequired,
          last_name: React.PropTypes.string.isRequired,
        }).isRequired
      })
    )
  }).isRequired,
  onClickDeleteServiceUpload: React.PropTypes.func.isRequired
};

export default ServiceUploadDetail;
