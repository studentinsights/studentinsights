window.shared || (window.shared = {});

const ProfileDetailsStyle = {
  feedCard: {
    marginBottom: 10,
    borderRadius: 10,
    fontSize: 14
  },
  feedCardHeader: {
    fontSize: 17,
    fontWeight: 400,
    color: '#555555'
  },
  box: {
    border: '1px solid #ccc',
    padding: 15,
    marginTop: 10,
    marginBottom: 10,
    width: '100%',
  },
  roundedBox: {
    border: '1px solid #ccc',
    padding: 15,
    marginTop: 10,
    marginBottom: 10,
    width: '100%',
    borderRadius: 5,
  },
  header: {
    display: 'flex',
    flexFlow: 'row',
    justifyContent: 'space-between'
  },
  title: {
    borderBottom: '1px solid #333',
    color: 'black',
    padding: 10,
    paddingLeft: 0,
    marginBottom: 10
  },
  schoolYearTitle: {
    padding: 10,
    paddingLeft: 10,
    marginBottom: 10,
    color: '#555555'
  },
  badge: {
    display: 'inline-block',
    width: '10em',
    textAlign: 'center',
    marginLeft: 10,
    marginRight: 10
  },
  tableHeader: {
    fontWeight: 'bold',
    textAlign: 'left',
    marginBottom: 10
  },
  accessLeftTableCell: {
    paddingRight: 25
  },
  accessTableFootnote: {
    fontStyle: 'italic',
    fontSize: 13,
    marginTop: 15,
    marginBottom: 20
  },
  fullCaseHistoryTitle: {
    color: 'black',
    display: 'inline-block',
    flex: 'auto',
  },
  sectionsRosterTitle: {
    color: 'black',
    display: 'inline-block',
    flex: 'auto',
  },
  fullCaseHistoryHeading: {
    display: 'flex',
    borderBottom: '1px solid #333',
    padding: 10,
    paddingLeft: 0,
  },
  studentReportButton: {
    width: '20em',
    fontSize: 12,
    padding: 8
  },
  type_to_color: {
    "Absence": '#e8fce8',
    "Tardy": '#e8fce8',
    "Incident": '#e8fce8',
    "Note": '#e8fce8',
    "Service": '#e8fce8',

    "MCAS-ELA": '#ffe7d6',
    "STAR-Reading": '#ffe7d6',

    "MCAS-Math": '#e8e9fc',
    "STAR-Math": '#e8e9fc',

    "DIBELS": '#e8fce8'
  },
  column: {
    flexGrow: '1',
    flexShrink: '0',
    padding: '22px 26px 16px 26px',
    cursor: 'pointer',
    borderColor: 'white',
    borderTop: 0,
    display: 'flex',
    flexDirection: 'column',
    margin: '0 5px 0 0',
    borderRadius: '5px 5px 5px 5px',
    border: '1px solid #ccc',
    width: '50%',
  },
  option3Column: {
    float: 'left',
    width: '33%'
  },
  option2Column: {
    float: 'left',
    width: '50%'
  },
  optionCheckbox: {
    float: 'left',
  },
  optionLabel: {
    float: 'left',
    padding: '0px 0px 20px 5px'
  },
  datepickerInput: {
    fontSize: 14,
    padding: 5,
    width: '50%'
  }
};

export default ProfileDetailsStyle;
