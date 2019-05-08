import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import * as Routes from '../helpers/Routes';
import Button from '../components/Button';
import Educator from '../components/Educator';
import GenericLoader from '../components/GenericLoader';
import SectionHeading from '../components/SectionHeading';
import SuccessLabel from '../components/SuccessLabel';
import tableStyles from '../components/tableStyles';
import {toMomentFromTimestamp} from '../helpers/toMoment';
import {shortSchoolName} from '../helpers/PerDistrict';
import {gradeText} from '../helpers/gradeText';
import {rankedByGradeLevel} from '../helpers/SortHelpers';
import IntroCopy from './IntroCopy';
import {fetchAllWorkspaces} from './api';

// Show users their class lists.  More useful for principals, building admin,
// or ELL/SPED teachers than classroom teachers (who are typically
// making a single list).
export default class ClassListsViewPage extends React.Component {
  render() {
    const {currentEducatorId, useTextLinks, includeHistorical} = this.props;
    return (
      <div className="ClassListsViewPage">
        <GenericLoader
          style={styles.root}
          promiseFn={() => fetchAllWorkspaces({includeHistorical})}
          render={json => (
            <ClassListsViewPageView
              currentEducatorId={currentEducatorId}
              useTextLinks={useTextLinks}
              {...json} />
          )} />
      </div>
    );
  }
}
ClassListsViewPage.propTypes = {
  currentEducatorId: PropTypes.number.isRequired,
  useTextLinks: PropTypes.bool,
  includeHistorical: PropTypes.bool
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

  onViewClicked(href, e) {
    e.preventDefault();
    window.location.href = href;
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
    const {districtKey} = this.context;
    const {workspaces, currentEducatorId} = this.props;
    if (workspaces.length === 0) return this.renderOverview();

    const sortedWorkspaces = _.orderBy(workspaces, workspace => {
      const classList = workspace.class_list;
      return [
        classList.school.name,
        rankedByGradeLevel(classList.grade_level_next_year),
        classList.submitted
      ];
    });

    const cell = {...tableStyles.cell, verticalAlign: 'middle'};
    return (
      <div>
        <div style={{marginLeft: 10}}>{this.renderNewButton()}</div>
        <table style={tableStyles.table}>
          <thead>
            <tr>
              <th style={tableStyles.headerCell}>School</th>
              <th style={tableStyles.headerCell}>Grade next year</th>
              <th style={tableStyles.headerCell}>Lists for?</th>
              <th style={tableStyles.headerCell}>Owner</th>
              <th style={tableStyles.headerCell}>Last updated</th>
              <th style={tableStyles.headerCell}>Status</th>
              <th style={tableStyles.headerCell} />
            </tr>
          </thead>
          <tbody>{sortedWorkspaces.map(workspace => {
            const classList = workspace.class_list;
            const createdAtMoment = toMomentFromTimestamp(classList.created_at).local();
            const educatorStyle = (classList.created_by_teacher_educator.id === currentEducatorId)
              ? { fontWeight: 'bold' }
              : {};
            return (
              <tr key={workspace.workspace_id}>
                <td style={cell}>{shortSchoolName(districtKey, classList.school.local_id)}</td>
                <td style={cell}>
                  {gradeText(classList.grade_level_next_year)}
                </td>
                <td style={cell}>
                  {['homeroom', 'homerooms', '(default)'].indexOf(classList.list_type_text.toLowerCase()) !== -1
                    ? <span style={{color: '#aaa'}}>{classList.list_type_text}</span>
                    : classList.list_type_text
                  }
                </td>
                <td style={cell}>
                  <Educator educator={classList.created_by_teacher_educator} style={educatorStyle} />
                </td>
                <td style={cell} title={`Revisions: ${workspace.revisions_count}`}>
                  {createdAtMoment.format('ddd M/D, h:mma')}
                </td>
                <td style={cell}>
                  {classList.submitted 
                    ? <SuccessLabel style={{padding: 5}} text="submitted" />
                    : 'in progress'}
                </td>
                <td style={{...cell, padding: 5}}>
                  {this.renderViewButton(classList.workspace_id)}
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

  renderViewButton(workspaceId) {
    const {useTextLinks} = this.props;
    const {text, href} = (useTextLinks)
      ? {text: 'view text', href: `/classlists/${workspaceId}/text`}
      : {text: 'view', href: `/classlists/${workspaceId}`};
    
    return (
      <Button
        style={styles.openButton}
        onClick={this.onViewClicked.bind(this, href)}
      >{text}
      </Button>
    );
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
ClassListsViewPageView.contextTypes = {
  districtKey: PropTypes.string.isRequired
};
ClassListsViewPageView.propTypes = {
  currentEducatorId: PropTypes.number.isRequired,
  workspaces: PropTypes.arrayOf(PropTypes.shape({
    workspace_id: PropTypes.string.isRequired,
    revisions_count: PropTypes.number.isRequired,
    class_list: PropTypes.shape({
      id: PropTypes.number.isRequired,
      workspace_id: PropTypes.string.isRequired,
      grade_level_next_year: PropTypes.string.isRequired,
      created_at: PropTypes.string.isRequired,
      updated_at: PropTypes.string.isRequired,
      submitted: PropTypes.bool.isRequired,
      created_by_teacher_educator: PropTypes.object.isRequired,
      school: PropTypes.object.isRequired,
    }).isRequired
  })).isRequired,
  useTextLinks: PropTypes.bool
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
  },
  openButton: {

  },
  openLink: {
    color: 'white'
  }
};
