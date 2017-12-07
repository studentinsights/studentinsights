import React from 'react';
import {merge} from '../helpers/ReactHelpers';

class ServiceUploadDetail extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      showStudentLinks: false,
      showDeletionConfirmation: false
    };
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
    const data = this.props.data;

    return (
      <div key={String(data.id)} style={this.dataCellStyle()}>
        <div style={{ marginBottom: 18 }}>
          <span style={{ fontSize: 22 }}>
            {data.file_name}
          </span>
          <span style={{ fontSize: 13, color: '#999', marginLeft: 15 }}>
            {'Uploaded ' + moment.utc((data.created_at).slice(0, 10)).format('M/D/YYYY')}
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
        <a style={window.shared.styles.link} onClick={this.toggleShowStudents}>
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
      return (
        <div>
          <br />
          <p>
            {'Are you suure you want to delete this upload and its ' +
            this.props.data.services.length +
            ' services?'}
          </p>
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
            style={merge(window.shared.styles.link, {
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
    if (!this.state.showStudentLinks) return null;

    const students = this.props.data.services.map(function(service) { return service.student; });

    const studentLinks = students.map(function(student) {
      return (
        <div
          key={this.props.data.file_name + ' ' + student.id}
          style={{
            marginLeft: 15
          }}>
          <li>
            <a href={'/students/' + student.id} style={window.shared.styles.link}>
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
  data: React.PropTypes.object.isRequired,
  onClickDeleteServiceUpload: React.PropTypes.func.isRequired
};

export default ServiceUploadDetail;
