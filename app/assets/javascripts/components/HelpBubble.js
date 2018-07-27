import ReactModal from 'react-modal';
import PropTypes from 'prop-types';
import React from 'react';

class HelpBubble extends React.Component {

  constructor(props){
    super(props);

    this.state = {
      modalIsOpen: false
    };

    this.closeModal = this.closeModal.bind(this);
    this.openModal = this.openModal.bind(this);
  }

  componentWillMount(){
    // This needs to be called for some reason, and we need to do it by the time the DOM exists.
    ReactModal.setAppElement(document.body);
  }

  closeModal(e){
    this.setState({modalIsOpen: false});
    e.preventDefault();
  }

  openModal(e){
    this.setState({modalIsOpen: true});
    e.preventDefault();
  }

  render(){
    const {style, linkStyle} = this.props;
    return (
      <div style={{display: 'inline', marginLeft: 10, ...style}}>
        <a href="#" onClick={this.openModal} style={{fontSize: 12, outline: 'none', ...linkStyle}}>
          {this.props.teaser}
        </a>
        {// The modal is not logically here, but even while not displayed it needs a location in the DOM.
        this.renderModal()}
      </div>
    );
  }

  renderModal(){
    // There are three ways to close a modal dialog: click on one of the close buttons,
    // click outside the bounds, or press Escape.
    return (
      <ReactModal isOpen={this.state.modalIsOpen} onRequestClose={this.closeModal}>
        {// Every help box has a title and two close buttons. The content is free-form HTML.
        <div className="modal-help">
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
          {// Fills the empty space
          <div style={{flex: 1, minHeight: 20}}>
            {""}
          </div>}
          <div>
            <a href="#" onClick={this.closeModal} style={{cursor: 'pointer'}}>
              (close)
            </a>
          </div>
        </div>}
      </ReactModal>
    );
  }
}

HelpBubble.propTypes = {
  title: PropTypes.string.isRequired, // e.g. 'What is a Note?'
  content: PropTypes.node.isRequired, // React DOM objects which will be displayed in the modal text box.
  teaser: PropTypes.node.isRequired, // text displayed before the user clicks, e.g. 'Find out more.'
  style: PropTypes.object,
  linkStyle: PropTypes.object
};

export default HelpBubble;

