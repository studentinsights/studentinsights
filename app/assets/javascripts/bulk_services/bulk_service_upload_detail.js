(function() {
  window.shared || (window.shared = {});
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;

  var BulkServiceUploadDetail = window.shared.BulkServiceUploadDetail = React.createClass({

    propTypes: {
      data: React.PropTypes.object.isRequired,
    },

    getInitialState: function () {
      return {
        showStudentLinks: false,
      };
    },

    render: function () {
      var data = this.props.data;

      return dom.div({
        style: this.dataCellStyle(),
        key: this.props.data.file_name
      },
        dom.div({
          style: {
            fontSize: 30, color: ' #4A90E2'
          }
        }, data.file_name),
        dom.span({ style: { color: '#333' }}, 'Uploaded ' + String(data.created_at).slice(0, 10)),
        this.infoSeparator(),
        dom.span({ style: { color: '#333' }}, String(data.services.length) + ' students'),
        this.infoSeparator(),
        dom.a({
          style: window.shared.styles.link,
          onClick: this.toggleShowStudents
        }, this.state.showStudentLinks ? 'Hide students' : 'Show students'),
        this.renderStudentLinks()
      );
    },

    renderStudentLinks: function () {
      if (!this.state.showStudentLinks) return null;

      var students = this.props.data.services.map(function(service) { return service.student; });

      var studentLinks = students.map(function(student) {
        return dom.div({
          key: this.props.data.file_name + ' ' + student.id,
          style: {
            marginLeft: 15
          }
        },
          dom.li({},
            dom.a({
              href: '/students/' + student.id,
              style: window.shared.styles.link
            }, [student.first_name, student.last_name].join(' '))
          )
        );
      }, this);

      return dom.div({}, dom.br({}), studentLinks);
    },

    toggleShowStudents: function () {
      this.setState({ showStudentLinks: !(this.state.showStudentLinks) })
    },

    dataCellStyle: function () {
      return {
        minHeight: 175,
        width: '100%',
        borderBottom: '1px solid #999',
        borderRight: '1px solid #999',
        padding: 20,
      };
    },

    infoSeparator: function () {
      return dom.span({}, ' | ');
    },

  });

})();
