import React from 'react';
import * as Routes from '../helpers/Routes';
import studentSearchbar from '../student_searchbar';


// Pure UI frame
export function NavbarFrame({children}) {
  return (
    <div className="NavbarFrame" style={styles.navbarFrame}>
      <a href="/">
        <div className="navbar-logo">
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
UI component for navigating across all pages.
*/
class Navbar extends React.Component {
  componentDidMount() {
    studentSearchbar();
  }

  render() {
    return <NavbarFrame>{this.renderLinks()}</NavbarFrame>;
  }

  renderLinks() {
    const districtwideAccess = false;
    const schoolwideAccess = false;
    const gradeLevelAccess = false;
    const districtwideAdminUrl = '/foo';
    const schoolId = null;

    return (
      <div style={styles.links}>
        {districtwideAccess &&
          <a style={styles.link} href={districtwideAdminUrl}>Admin</a>}
        {schoolwideAccess || gradeLevelAccess &&
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
  renderSignOutLink() {
    return <a rel="nofollow" data-method="delete" href="/educators/sign_out">Sign Out</a>;
  }
}


const styles = {
  navbarFrame: {
    margin: '0 20px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-end'
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
  logo: {
    display: 'inline-block',
    width: 210,
    height: 60,
    position: 'relative',
    top: 10
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