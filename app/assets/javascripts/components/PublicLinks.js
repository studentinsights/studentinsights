import React from 'react';
import PropTypes from 'prop-types';


export function Website(props) {
  return <a {...props} href="https://www.studentinsights.org">studentinsights.org</a>;
}


export function HelpEmail(props) {
  return <a {...props} href="mailto://help@studentinsights.org">{props.children || 'help@studentinsights.org'}</a>;
}
HelpEmail.propTypes = {
  children: PropTypes.node
};


export function Email(props) {
  return <a {...props} href="mailto://ideas@studentinsights.org">{props.children || 'ideas@studentinsights.org'}</a>;
}
Email.propTypes = {
  children: PropTypes.node
};

export function WebsiteInsightExample(props) {
  return <a {...props} href="https://www.studentinsights.org/our-work.html#seeing-the-whole-child">{props.children || 'studentinsights.org'}</a>; 
}
WebsiteInsightExample.propTypes = {
  children: PropTypes.node
};

