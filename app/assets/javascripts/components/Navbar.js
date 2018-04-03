import React from 'react';
import * as Routes from '../helpers/Routes';
import studentSearchbar from '../student_searchbar';
import RailsLinkMethod from './RailsLinkMethod';
import SharedPropTypes from '../helpers/prop_types.jsx';


// Pure UI frame
export function NavbarFrame({children}) {
  return (
    <div className="NavbarFrame" style={styles.navbarFrame}>
      <a href="/">
        <div className="nav-logo">
          <div className="title" alt="Student Insights"></div>
        </div>
      </a>
      {children}
    </div>
  );
}
NavbarFrame.propTypes = {
  children: React.PropTypes.node.isRequired
};



/*
UI component for navigating across all pages.  Includes links,
search bar and sign out link.
*/
class Navbar extends React.Component {
  componentDidMount() {
    studentSearchbar();
  }

  render() {
    return <NavbarFrame>{this.renderLinks()}</NavbarFrame>;
  }

  renderLinks() {
    const {
      districtwideAccess,
      schoolwideAccess,
      gradeLevelAccess,
      schoolId
    } = this.props;

    return (
      <div style={styles.links}>
        {districtwideAccess &&
          <a style={styles.link} href={Routes.districtwideAdmin()}>Admin</a>}
        {schoolwideAccess || gradeLevelAccess.length > 0 &&
          <a style={styles.link} href={Routes.school(schoolId)}>Roster</a>}
        {schoolwideAccess && !districtwideAccess &&
          <span>
            <a style={styles.link} href={Routes.absencesDashboard(schoolId)}>Absences</a>
            <a style={styles.link} href={Routes.tardiesDashboard(schoolId)}>Tardies</a>
          </span>}
        <a style={styles.link} href="/educators/notes_feed">My notes</a>
        <a style={styles.link} href="/home">Home</a>
        {this.renderSearchbar()}
        {this.renderSignOutLink()}
      </div>
    );
  }

  renderSearchbar() {
    return (
      <span style={styles.searchBar}>
        <p style={styles.searchLabel}>Search for student:</p>
        <input className="student-searchbar" />
      </span>
    );
  }

  // This relies on the Rails `jquery_ujs` code to read the `data-method` attribute
  // and do the right thing to submit this link.
  // See https://github.com/rails/jquery-ujs/blob/master/src/rails.js#L212 for source.
  renderSignOutLink() {
    return (
      <RailsLinkMethod method="delete" href="/educators/sign_out">
        Sign Out
      </RailsLinkMethod>
    );
  }
}
Navbar.propTypes = {
  districtwideAccess: React.PropTypes.bool.isRequired,
  schoolwideAccess: React.PropTypes.bool.isRequired,
  gradeLevelAccess: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
  schoolId: SharedPropTypes.nullableWithKey(React.PropTypes.number)
};

const styles = {
  navbarFrame: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 20,
    borderBottom: '1px solid #ccc',
    backgroundColor: 'white'
  },
  links: {
    flex: 1,
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  link: {
    paddingLeft: 10,
    paddingRight: 10
  },
  searchBar: {
    marginLeft: 20,
    marginRight: 20
  },
  searchLabel: {
    display: 'inline-block',
    paddingRight: 5
  }
};
  
export default Navbar;