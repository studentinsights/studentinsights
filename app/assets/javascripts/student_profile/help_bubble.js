(function() {
  window.shared || (window.shared = {});
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;

  // var styles = {
  //   bubble: {
  //     fontSize: 14,
  //     width: 20,
  //     height: 20,
  //     marginLeft: 5,
  //     color: 'white',
  //     borderRadius: 30,
  //     textAlign: 'center',
  //     display: 'inline-block',
  //     backgroundColor: '#3177AF',
  //     cursor: 'pointer'
  //   }
  // };

// Who can enter a note? Anyone who works with or involved with the student, including classroom/ELL/SPED teachers, principals/assistant principals, counselors, and attendance officers.

// What can I/should I put in a note? The true test is to think about whether the information will help your team down the road in supporting this student, either in the coming weeks, or a few years from now.
  var HelpBubble = window.shared.HelpBubble = React.createClass({
    propTypes: {
      content: React.PropTypes.string.isRequired
    },

    getInitialState: function(){ return {modalIsOpen: false}; },
    closeModal: function(){ this.setState({modalIsOpen: false}); },
    openModal: function(){ this.setState({modalIsOpen: true}); },
    componentWillMount: function(){
      // This needs to be called for some reason, and we need to do it by the time the DOM exists.
      ReactModal.setAppElement(document.body);
    },

    render: function(){
      return dom.div({style: {display: 'inline'}},
        dom.span({className: 'HelpBubble', onClick: this.openModal}, '?'),
        this.renderModal() // The modal is not logically here, but even while hidden it needs a location in the DOM.
      );
    },

    renderModal: function(){
      return createEl(ReactModal, {
        isOpen: this.state.modalIsOpen,
        onRequestClose: this.closeModal
      },
        dom.h1({}, "What is a Note?"), dom.a({href: '', onClick: this.closeModal, style: {float: 'right'}}, 'X'),
        dom.br(),
        dom.p({}, "The Notes tab is the place to keep notes about a student, whether it’s SST, MTSS, a parent conversation, or some informal strategies that a teacher/team is using to help a student."),
        dom.br(),
        dom.p({}, "Who can enter a note? Anyone who works with or involved with the student, including classroom/ELL/SPED teachers, principals/assistant principals, counselors, and attendance officers."),
        dom.p({}, "What can I/should I put in a note? The true test is to think about whether the information will help your team down the road in supporting this student, either in the coming weeks, or a few years from now.")
      );
    }
  });
})();
