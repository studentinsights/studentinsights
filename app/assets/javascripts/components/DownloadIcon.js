import React from 'react';
import PropTypes from 'prop-types';


export default function DownloadIcon({style = {}}) {
  return <svg style={{fill: "#3177c9", opacity: 0.5, cursor: 'pointer', ...style}} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/><path d="M0 0h24v24H0z" fill="none"/></svg>;
}
DownloadIcon.propTypes = {
  style: PropTypes.object
};