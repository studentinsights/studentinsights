import React from 'react';
import _ from 'lodash';
import SectionHeading from '../components/SectionHeading';
import ExperimentalBanner from '../components/ExperimentalBanner';
import GenericLoader from '../components/GenericLoader';
import {apiFetchJson} from '../helpers/apiFetchJson';


// TODO(kr)
class TieringPage extends React.Component {
  constructor(props) {
    super(props);
    this.fetchTiering = this.fetchTiering.bind(this);
    this.renderTiering = this.renderTiering.bind(this);
  }

  fetchTiering() {
    const {schoolId} = this.props;
    const url = `/api/tiering/${schoolId}`;
    return apiFetchJson(url).then(json => json.students_with_tiering);
  }

  render() {
    return (
      <div className="TieringPage">
        <ExperimentalBanner />
        <SectionHeading>Tiering: v1 prototype</SectionHeading>
        <p>Tiering is computed over the last 45 days, looking at academic grades, absences and discipline incidents (NOTE: not actions yet).</p>
        <GenericLoader
          promiseFn={this.fetchTiering}
          render={this.renderTiering} />
      </div>
    );
  }

  renderTiering(studentsWithTiering) {
    return (
      <div>
        <div>{this.renderTierCount(studentsWithTiering, 0)}</div>
        <div>{this.renderTierCount(studentsWithTiering, 1)}</div>
        <div>{this.renderTierCount(studentsWithTiering, 2)}</div>
        <div>{this.renderTierCount(studentsWithTiering, 3)}</div>
        <div>{this.renderTierCount(studentsWithTiering, 4)}</div>
        <div>{this.renderTable(studentsWithTiering)}</div>
      </div>
    );
  }

  renderTierCount(studentsWithTiering, n) {
    const count = studentsWithTiering.filter(s => s.tier.level === n).length;
    const percentage = Math.round(100 * count / studentsWithTiering.length);
    return <div>Tier {n}: {count}, {percentage}%</div>;
  }

  renderTable(studentsWithTiering) {
    // TODO(kr) hacked sorting
    const sortedStudentsWithTiering = _.sortBy(studentsWithTiering, s => {
      return s.tier.level * -1 * 10 + s.tier.triggers.length * -1;
    });
    return (
      <table>
        <thead>
          <tr>
            <th>Student</th>
            <th>Tier</th>
            <th>Triggers</th>
            <th>Absences</th>
            <th>ELA</th>
            <th>History</th>
            <th>Math</th>
            <th>Science</th>
          </tr>
        </thead>
        <tbody>{sortedStudentsWithTiering.map(studentWithTiering => {
          const {tier} = studentWithTiering;
          const student = studentWithTiering;
          return (
            <tr key={studentWithTiering.id}>
              <td><a style={styles.person} href={`/students/${student.id}`}>{student.first_name} {student.last_name}</a></td>
              <td>{tier.level}</td>
              <td>{tier.triggers.join(' ')}</td>
            </tr>
          );
        })}</tbody>
      </table>
    );
  }
}
TieringPage.propTypes = {
  schoolId: React.PropTypes.string.isRequired
};


const styles = {
  person: {
    fontWeight: 'bold'
  }
};

export default TieringPage;