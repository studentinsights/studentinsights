(function() {
  window.shared || (window.shared = {});
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;

  var HelpBubble = window.shared.HelpBubble = React.createClass({
    propTypes: {
      title: React.PropTypes.string.isRequired, // e.g. 'What is a Note?'
      content: React.PropTypes.string.isRequired, // HTML string which will be rendered in the modal's box.
      teaserText: React.PropTypes.string.isRequired // text displayed before the user clicks, e.g. 'Find out more.'
    },

    getInitialState: function(){ return {modalIsOpen: false}; },
    closeModal: function(e){
      this.setState({modalIsOpen: false});
      e.preventDefault();
    },
    openModal: function(e){
      this.setState({modalIsOpen: true});
      e.preventDefault();
    },
    componentWillMount: function(){
      // This needs to be called for some reason, and we need to do it by the time the DOM exists.
      ReactModal.setAppElement(document.body);
    },

    render: function(){
      return dom.div({style: {display: 'inline', marginLeft: 10}},
        dom.a({href: '#', onClick: this.openModal, style: {fontSize: 12, outline: 'none'}}, this.props.teaserText),
        // dom.span({className: 'HelpBubble', onClick: this.openModal}, '?'),
        this.renderModal() // The modal is not logically here, but even while not displayed it needs a location in the DOM.
      );
    },

    renderModal: function(){
      // There are three ways to close a modal dialog: click on one of the close buttons,
      // click outside the bounds, or press Escape.
      return createEl(ReactModal, {
        isOpen: this.state.modalIsOpen,
        onRequestClose: this.closeModal
      },
      // Every help box has a title and two close buttons. The content is free-form HTML.
        dom.div({className: 'modal-help'},
          dom.div({style: {borderBottom: '1px solid #333', paddingBottom: 10, marginBottom: 20}},
            dom.h1({style: {display: 'inline-block'}}, this.props.title),
            dom.a({href: '#', onClick: this.closeModal, style: {float: 'right', cursor: 'pointer'}}, '(ESC)')
          ),
          dom.div({
            // React says this is 'dangerous' because rendering an untrusted string can allow an
            // XSS attack; however, we generated this string, so we trust it.
            dangerouslySetInnerHTML: {__html: this.props.content}
          }),
          dom.div({}, dom.a({
            href: '#', onClick: this.closeModal,
            style: {cursor: 'pointer', position: 'absolute', bottom: 20, left: 20},
          }, '(close)'))
        )
      );
    }
  });
})();
