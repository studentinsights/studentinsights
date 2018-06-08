import React from 'react';
import _ from 'lodash';
import * as Routes from '../helpers/Routes';
import Button from '../components/Button';
import School from '../components/School';
import Educator from '../components/Educator';
import GenericLoader from '../components/GenericLoader';
import SectionHeading from '../components/SectionHeading';
import SuccessLabel from '../components/SuccessLabel';
import tableStyles from '../components/tableStyles';
import {toMomentFromTime} from '../helpers/toMoment';
import {gradeText} from '../helpers/gradeText';
import {rankedByGradeLevel} from '../helpers/SortHelpers';
import IntroCopy from './IntroCopy';
import {fetchAllWorkspaces} from './api';


// Show users their class lists.  More useful for principals, building admin,
// or ELL/SPED teachers than classroom teachers (who are typically
// making a single list).

export default class ClassListsViewPage extends React.Component {
  render() {
    const {currentEducatorId} = this.props;
    return (
      <div className="ClassListsViewPage">
        <GenericLoader
          style={styles.root}
          promiseFn={fetchAllWorkspaces}
          render={json => (
            <ClassListsViewPageView
              currentEducatorId={currentEducatorId}
              {...json} />
          )} />
      </div>
    );
  }
}
ClassListsViewPage.propTypes = {
  currentEducatorId: React.PropTypes.number.isRequired
};

// View component
export class ClassListsViewPageView extends React.Component {
  constructor(props) {
    super(props);
    this.onNewClicked = this.onNewClicked.bind(this);
  }

  onNewClicked(e) {
    e.preventDefault();
    window.location.href = Routes.newClassList();
  }

  render() {
    return (
      <div>
        <SectionHeading>Class List Creator</SectionHeading>
        {this.renderTable()}
      </div>
    );
  }

  renderTable() {
    const {workspaces, currentEducatorId} = this.props;
    if (workspaces.length === 0) return this.renderOverview();

    const sortedWorkspaces = _.sortByOrder(workspaces, workspace => {
      const classList = workspace.class_list;
      return [
        classList.school.name,
        rankedByGradeLevel(classList.grade_level_next_year),
        classList.submitted
      ];
    });

    return (
      <div>
        <div style={{marginLeft: 10}}>{this.renderNewButton()}</div>
        <table style={tableStyles.table}>
          <thead>
            <tr>
              <th style={tableStyles.headerCell}>School</th>
              <th style={tableStyles.headerCell}>Grade next year</th>
              <th style={tableStyles.headerCell}>Owner</th>
              <th style={tableStyles.headerCell}>Last updated</th>
              <th style={tableStyles.headerCell}>Status</th>
              <th style={tableStyles.headerCell} />
            </tr>
          </thead>
          <tbody>{sortedWorkspaces.map(workspace => {
            const classList = workspace.class_list;
            const createdAtMoment = toMomentFromTime(classList.created_at).local();
            const educatorStyle = (classList.created_by_teacher_educator.id === currentEducatorId)
              ? { fontWeight: 'bold' }
              : {};
            return (
              <tr key={workspace.workspace_id}>
                <td style={tableStyles.cell}><School {...classList.school} /></td>
                <td style={tableStyles.cell}>
                  {gradeText(classList.grade_level_next_year)}
                </td>
                <td style={tableStyles.cell}>
                  <Educator educator={classList.created_by_teacher_educator} style={educatorStyle} />
                </td>
                <td style={tableStyles.cell} title={`Revisions: ${workspace.revisions_count}`}>
                  {createdAtMoment.format('dddd M/D, h:mma')}
                </td>
                <td style={tableStyles.cell}>
                  {classList.submitted && <SuccessLabel style={{padding: 5}} text="submitted" />}
                </td>
                <td style={tableStyles.cell}>
                  <a style={{padding: 10}} href={`/classlists/${classList.workspace_id}`}>open</a>
                </td>
              </tr>
            );
          })}</tbody>
        </table>
      </div>
    );
  }

  renderNewButton() {
    return <Button style={styles.newButton} onClick={this.onNewClicked}>New list</Button>;
  }

  renderOverview() {
    return (
      <div style={styles.overview}>
        <IntroCopy />
        {this.renderNewButton()}
      </div>
    );
  }
}
ClassListsViewPageView.propTypes = {
  currentEducatorId: React.PropTypes.number.isRequired,
  workspaces: React.PropTypes.arrayOf(React.PropTypes.shape({
    workspace_id: React.PropTypes.string.isRequired,
    revisions_count: React.PropTypes.number.isRequired,
    class_list: React.PropTypes.shape({
      id: React.PropTypes.number.isRequired,
      workspace_id: React.PropTypes.string.isRequired,
      grade_level_next_year: React.PropTypes.string.isRequired,
      created_at: React.PropTypes.string.isRequired,
      updated_at: React.PropTypes.string.isRequired,
      submitted: React.PropTypes.bool.isRequired,
      created_by_teacher_educator: React.PropTypes.object.isRequired,
      school: React.PropTypes.object.isRequired,
    }).isRequired
  })).isRequired
};


const styles = {
  root: {
    padding: 10
  },
  newButton: {
    display: 'block',
    marginTop: 10
  },
  overview: {
    margin: 10
  },
  p: {
    marginBottom: 10
  }
};
