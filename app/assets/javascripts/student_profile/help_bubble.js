(function() {
  window.shared || (window.shared = {});
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;

  var HelpBubble = window.shared.HelpBubble = React.createClass({
    propTypes: {
      title: React.PropTypes.string.isRequired,
      content_id: React.PropTypes.string.isRequired
    },

    getInitialState: function(){ return {modalIsOpen: false}; },
    closeModal: function(e){
      this.setState({modalIsOpen: false}); e.preventDefault();
    },
    openModal: function(e){ this.setState({modalIsOpen: true}); },
    componentWillMount: function(){
      // This needs to be called for some reason, and we need to do it by the time the DOM exists.
      ReactModal.setAppElement(document.body);
    },

    render: function(){
      return dom.div({style: {display: 'inline'}},
        dom.span({className: 'HelpBubble', onClick: this.openModal}, '?'),
        this.renderModal() // The modal is not logically here, but even while not displayed it needs a location in the DOM.
      );
    },

    renderModal: function(){
      return createEl(ReactModal, {
        isOpen: this.state.modalIsOpen,
        onRequestClose: this.closeModal
      },
        dom.div({className: 'modal-help'},
          dom.div({style: {borderBottom: '1px solid #333', paddingBottom: 10, marginBottom: 20}},
            dom.h1({style: {display: 'inline-block'}}, this.props.title),
            dom.a({href: '#', onClick: this.closeModal, style: {float: 'right', cursor: 'pointer'}}, '(ESC)')
          ),
          dom.div({
            dangerouslySetInnerHTML: {__html: $("#" + this.props.content_id).html()}
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
