(function() {
  window.shared || (window.shared = {});
  const ReactModal = window.ReactModal;
  const styles = {
    content: {
      top: '10%',
      bottom: '45%',
      left: '33%',
      right: '33%',
      padding: '2%'
    }
  };

  window.shared.ModalSmall = React.createClass({
    propTypes: {
      title: React.PropTypes.string.isRequired,
      content: React.PropTypes.object.isRequired, // React DOM objects which will be displayed in the modal text box.
      icon: React.PropTypes.object.isRequired, // React DOM object which will be clicked to open the modal.
    },

    getInitialState: function(){
      return {modalIsOpen: false};
    },

    componentWillMount: function(){
      // This needs to be called for some reason, and we need to do it by the time the DOM exists.
      ReactModal.setAppElement(document.body);
    },

    closeModal: function(e){
      this.setState({modalIsOpen: false});
      e.preventDefault();
    },

    openModal: function(e){
      this.setState({modalIsOpen: true});
      e.preventDefault();
    },

    render: function(){
      return (
        <div style={{display: 'inline', marginLeft: 10}} className='click-event-modal'>
          <a href="#" onClick={this.openModal} style={{fontSize: 12, outline: 'none'}}>
            {this.props.icon}
          </a>
          {// The modal is not logically here, but even while not displayed it needs a location in the DOM.
          this.renderModal()}
        </div>
      );
    },

    renderModal: function(){
      // There are three ways to close a modal dialog: click on one of the close buttons,
      // click outside the bounds, or press Escape.
      return (
        <ReactModal
          isOpen={this.state.modalIsOpen}
          onRequestClose={this.closeModal}
          style={styles}
        >
          {
          <div className="contact-info-modal">
            <div
              style={{borderBottom: '1px solid #333', paddingBottom: 10, marginBottom: 20}}>
              <h1 style={{display: 'inline-block'}}>
                {this.props.title}
              </h1>
              <a
                href="#"
                onClick={this.closeModal}
                style={{float: 'right', cursor: 'pointer'}}>
                (ESC)
              </a>
            </div>
            <div>
              {this.props.content}
            </div>
          </div>}
        </ReactModal>
      );
    }
  });
})();
