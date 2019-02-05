import PropTypes from 'prop-types';
import React from 'react';
import _ from 'lodash';
import GenericLoader from '../components/GenericLoader';
import {apiFetchJson} from '../helpers/apiFetchJson';
import {updateGlobalStylesToTakeFullHeight} from '../helpers/globalStylingWorkarounds';


export default class PermissionsPage extends React.Component {
  constructor(props) {
    super(props);
    this.fetchJson = this.fetchJson.bind(this);
    this.renderJson = this.renderJson.bind(this);
  }

  componentDidMount() {
    updateGlobalStylesToTakeFullHeight();
  }

  fetchJson() {
    const url = `/api/permissions/authorization_json`;
    return apiFetchJson(url);
  }

  render() {
    return (
      <div className="PermissionsPage" style={styles.flexVertical}>
        <GenericLoader
          promiseFn={this.fetchJson}
          style={styles.flexVertical}
          render={this.renderJson} />
      </div>
    );
  }

  renderStudents(json) {
    return (
      <PermissionsPageView
        navbarLinksMap={json.nav_bar_links_map}
        sortedAllEducators={json.sorted_all_educators}
      />
    );
  }
}

class PermissionsPageView extends React.Component {
  render() {
    return (
      <div className="PermissionsPageView">
        {this.renderNavbarLinks()}
        {this.renderSensitiveAccess()}
        {this.renderEducators()}
      </div>
    );
  }

  renderNavbarLinks() {
    return (
      <div>
        <div>Educator permissions:</div>
        <a href="/admin/authorization">Overview</a>
        <a href="/admin">Adjust</a>
      </div>
    ); 
  }

  renderSensitiveAccess() {
    const canSetEducators = [];
    const adminEducators = [];
    const restrictedNotesEducators = [];
    const districtwideEducators = [];

    const sensitiveList = _.uniq([]
      .concat(canSetEducators)
      .concat(adminEducators)
      .concat(districtwideEducators));

    return (
      <div>
        <h2>Sensitive access</h2>
        <div style={{padding: 20}}>
          <div>
            <div>Can set access: {canSetEducators.length}</div>
            <div>Admin: {adminEducators.length}</div>
            <div>Restricted notes: {restrictedNotesEducators.length}</div>
            <div>Districtwide: {districtwideEducators.length}</div>
          </div>
          <table style={{marginTop: 40, textAlign: 'left'}}>
            <thead>
              <tr>
                <th>Email</th>
                <th>Name</th>
                <th>Can set access</th>
                <th>Admin</th>
                <th>Restricted notes</th>
                <th>Districtwide</th>
                <th>School</th>
              </tr>
            </thead>
            <tbody>
              {sensitiveList.map(educator => (
                <tr>
                  <td>{educator.email}</td>
                  <td><a href={`/educators/view/${educator.id}`}>{educator.full_name}</a></td>
                  <td>{educator.can_set_districtwide_access}</td>
                  <td>{educator.admin}</td>
                  <td>{educator.can_view_restricted_notes}</td>
                  <td>{educator.districtwide_access}</td>
                  <td>{educator.school ? educator.school.name : '(none)'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  renderEducators() {
    const {sortedAllEducators} = this.props;
    return (
      <div>
        <h2>Educator homepages</h2>
        <div style={{padding: 20}}>
          <table style={{marginTop: 40, textAlign: 'left', borderCollapse: 'collapse'}}>
            <thead>
              <tr style={{verticalAlign: 'top'}}>
                <th style={{padding: 5, background: '#ccc'}}>Email</th>
                <th style={{padding: 5, background: '#ccc'}}>Name</th>
                <th style={{padding: 5, background: '#ccc'}}>Masquerade</th>
                <th style={{padding: 5, background: '#ccc'}}>School</th>
                <th style={{padding: 5, background: '#ccc'}}>Links</th>
              </tr>
            </thead>
            <tbody>
              {sortedAllEducators.map(educator => (
                <tr style={{verticalAlign: 'top'}}>
                  <td style={{padding: 5}}>{educator.email}</td>
                  <td style={{padding: 5}}>
                    <a href={`/educators/view/${educator.id}`}>{educator.full_name}</a>
                  </td>
                  <td>{this.renderMasqueradeLink(educator)}</td>
                  <td style={{padding: 5}}>{educator.school ? educator.school.name : '(none)'}</td>
                  <td>{this.renderEducatorNavbarLinks(educator)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  renderMasqueradeLink(educator) {
    // <% if current_educator(super: true) != educator && current_educator != educator %>
    //   <%= link_to 'become', admin_masquerade_become_path(masquerading_educator_id: educator.id), { method: :post, class: 'become-link' } %>
    // <% end %>
  }

  renderEducatorNavbarLinks(educator) {
    // <% @navbar_links_map[educator.id].map do |path, key| %>
    //   <%= link_to path, key %>
    // <% end %>
  }
}
PermissionsPageView.propTypes = {
  navbarLinksMap: PropTypes.object.isRequired,
  sortedAllEducators: PropTypes.arrayOf({
    id: PropTypes.number.isRequired,
    full_name: PropTypes.string.isRequired,
    can_set_districtwide_access: PropTypes.bool.isRequired,
    admin: PropTypes.bool.isRequired,
    can_view_restricted_notes: PropTypes.bool.isRequired,
    districtwide_access: PropTypes.bool.isRequired,
    school: PropTypes.shape({
      name: PropTypes.string
    })
  })
};

const styles = {
  flexVertical: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column'
  }
};