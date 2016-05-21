(function() {
  window.shared || (window.shared = {});
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;

  var Educator = window.shared.Educator;
  var moment = window.moment;
  var sanitize = new Sanitize({
    elements: ['br', 'div', 'p']
  });

  var styles = {
    note: {
      border: '1px solid #eee',
      padding: 15,
      marginTop: 10,
      marginBottom: 10
    },
    date: {
      display: 'inline-block',
      width: '11em',
      paddingRight: 10,
      fontWeight: 'bold'
    },
    educator: {
      paddingLeft: 5,
      display: 'inline-block'
    },
    noteText: {
      marginTop: 5,
      padding: 0,
      resize: 'none',
      overflow: 'auto',
      fontFamily: "'Open Sans', sans-serif",
      fontSize: 14,
      whiteSpace: 'pre-wrap'
    }
  };

  // Given a string of HTML, sanitize it by removing elements that are not
  // whitelisted.
  function htmlToSanitizedHTML(html) {
    var node = document.createElement('div');
    var newNode = document.createElement('div');
    var sanitizedHTML;

    node.innerHTML = html;
    sanitizedDOM = sanitize.clean_node(node);

    while (sanitizedDOM.childNodes.length > 0) {
      newNode.appendChild(sanitizedDOM.childNodes[0]);
    }

    return newNode.innerHTML;
  }

  // Given a DOM node and its previous sibling (if it has one), attempt to
  // transform it into text with reasonable whitespace and newlines.
  function domNodeToText(node, previousSiblingNode) {
    var text = '';

    if (
      previousSiblingNode
      && _(['BR', 'DIV', 'P']).contains(node.tagName)
    ) {
      text = '\n';
    }
    else if (
      previousSiblingNode
      && previousSiblingNode.nodeType === Node.TEXT_NODE
    ) {
      text = ' ';
    }

    if (node.childNodes.length === 0) {
      text = text.concat(node.textContent);
    }
    else {
      for (var i = 0; i < node.childNodes.length; i++) {
        text = text.concat(domNodeToText(node.childNodes[i], i > 0 && node.childNodes[i - 1]));
      }
    }

    return text;
  }

  // Convert HTML to text. This will involve attempting to add expected
  // whitespace and newlines.
  function htmlToText(html) {
    var node = document.createElement('div');

    node.innerHTML = html;

    return domNodeToText(node);
  }

  // Convert plain text to HTML. For our purposes, this just means replacing
  // newlines with `<br>` tags.
  function textToHTML(text) {
    var html = text || '';

    html = html.replace(/\n/g, '<br>');

    return html;
  }

  // Convert text, which possibly contains HTML-meaningful characters, into
  // sanitized HTML.
  function textToSanitizedHTML(text) {
    return textToHTML(_.escape(text));
  }

  // This renders a single card for a Note of any type.
  var NoteCard = window.shared.NoteCard = React.createClass({
    displayName: 'NoteCard',

    propTypes: {
      noteMoment: React.PropTypes.instanceOf(moment).isRequired,
      educatorId: React.PropTypes.number.isRequired,
      badge: React.PropTypes.element.isRequired,
      text: React.PropTypes.string.isRequired,
      onSave: React.PropTypes.func,
      eventNoteId: React.PropTypes.number,
      eventNoteTypeId: React.PropTypes.number,
      educatorsIndex: React.PropTypes.object.isRequired
    },

    getInitialState: function() {
      return {
        text: this.props.text
      };
    },

    onBlurText: function(event) {
      var params = {
        id: this.props.eventNoteId,
        eventNoteTypeId: this.props.eventNoteTypeId,
        text: this.state.text
      };
      this.props.onSave(params);
    },

    shouldComponentUpdate: function(nextProps, nextState) {
      var currentHTML = this.contentEditableEl.innerHTML;

      return currentHTML !== htmlToSanitizedHTML(currentHTML)
        || nextState.text !== htmlToText(currentHTML);
    },

    componentDidUpdate: function() {
      var expectedHTML = textToSanitizedHTML(this.state.text);

      if (
        this.contentEditableEl
        && expectedHTML !== this.contentEditableEl.innerHTML
      ) {
       this.contentEditableEl.innerHTML = expectedHTML;
      }
    },

    onModifyText: function(){
      var text = htmlToText(this.contentEditableEl.innerHTML);

      if (text !== this.lastText) {
        this.setState({ text: text });
      }

      this.lastText = text;
    },

    render: function() {
      return dom.div({
        className: 'NoteCard',
        style: styles.note
      },
        dom.div({},
          dom.span({ className: 'date', style: styles.date }, this.props.noteMoment.format('MMMM D, YYYY')),
          this.props.badge,
          dom.span({ style: styles.educator }, createEl(Educator, {
            educator: this.props.educatorsIndex[this.props.educatorId]
          }))
        ),
        dom.div({
          contentEditable: true,
          className: 'note-text',
          style: styles.noteText,
          ref: function(ref) { this.contentEditableEl = ref; }.bind(this),
          dangerouslySetInnerHTML: { __html: textToSanitizedHTML(this.state.text) },
          onInput: this.onModifyText,
          onKeyUp: this.onModifyText,
          onPaste: this.onModifyText,
          onBlur: this.onBlurText
        })
      );
    }
  });
})();
