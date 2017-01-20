(function() {
  window.shared || (window.shared = {});
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;

  var ServiceUploadDetail = window.shared.ServiceUploadDetail = React.createClass({

    propTypes: {
      data: React.PropTypes.object.isRequired,
      onClickDeleteServiceUpload: React.PropTypes.func.isRequired
    },

    getInitialState: function () {
      return {
        showStudentLinks: false,
        showDeletionConfirmation: false,
      };
    },

    render: function () {
      var data = this.props.data;

      return dom.div({ key: String(data.id), style: this.dataCellStyle() },
        dom.div({ style: { marginBottom: 18 } },
          dom.span({ style: { fontSize: 22 } }, data.file_name),
          dom.span({ style: { fontSize: 13, color: '#999', marginLeft: 15 }},
            'Uploaded ' + moment.utc((data.created_at).slice(0, 10)).format('M/D/YYYY')
          )
        ),
        this.renderServiceTypeName(),
        dom.div({},
          dom.span({ style: { color: '#333' }}, String(data.services.length) + ' students'),
          this.renderShowStudentsLink(),
          this.renderDeletionArea()
        ),
        this.renderStudentLinks()
      );
    },

    renderShowStudentsLink: function () {
      if (this.props.data.services.length === 0) return;

      return dom.span({},
        this.infoSeparator(),
        dom.a({
          style: window.shared.styles.link,
          onClick: this.toggleShowStudents
        }, this.state.showStudentLinks ? 'Hide students' : 'Show students')
      );
    },

    renderServiceTypeName: function () {
      var service = this.props.data.services[0];

      if (!service) return;

      return dom.div({ style: { marginBottom: 18, fontSize: 18, color: '#555' } },
        service.service_type.name
      )
    },

    renderDeletionArea: function () {
      if (this.state.showDeletionConfirmation) {
        return dom.div({},
          dom.br({}),
          dom.p({},
            'Are you suure you want to delete this upload and its ' +
            this.props.data.services.length +
            ' services?'),
          dom.br({}),
          dom.button({
            className: 'btn',
            onClick: this.props.onClickDeleteServiceUpload.bind(null, this.props.data.id)
          }, 'Yes, confirm deletion.'),
          dom.button({
            className: 'btn',
            onClick: this.toggleDeletionConfirmation,
            style: { marginLeft: 10 }
          }, 'Cancel deletion.')
        );
      } else {
        return dom.span({},
          this.infoSeparator(),
          dom.a({
            style: merge(window.shared.styles.link, {
              color: 'red', fontSize: 15
            }),
            onClick: this.toggleDeletionConfirmation
          }, 'Delete')
        );
      };
    },

    toggleDeletionConfirmation: function () {
      this.setState({ showDeletionConfirmation: !this.state.showDeletionConfirmation })
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
        width: '100%',
        borderBottom: '1px solid #999',
        borderLeft: '1px solid #999',
        padding: 30,
      };
    },

    infoSeparator: function () {
      return dom.span({}, ' | ');
    },

  });

})();
