
;(function (w, doc) {

  // Enable strict mode
  "use strict";

  // Local object for method references
  var Corkscrew = {};

  // Namespace
  Corkscrew.ns = "Corkscrew";

  // Start defining methods here
  Corkscrew.init = function() {

    Corkscrew.addHTMLView();

    doc.getElementById('cs-nav-menu-toggle').addEventListener('click', function(e){

      e.preventDefault();
      doc.getElementById('cs-site-nav').classList.toggle('is-open');

    }, false);

  };

  // Convert a hax code to an RGB color value
  Corkscrew.hexToRgb = function ( hex ) {

    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
        all: parseInt(result[1], 16) + ',' + parseInt(result[2], 16) + ',' + parseInt(result[3], 16)
    } : null;

  }; // hexToRgb()

  Corkscrew.generateSlug = function( baseName ) {

    var slug = baseName + Math.floor(Math.random() * (9999 - 1)) + 1;

    return slug;

  };

  Corkscrew.addHTMLView = function() {

  var modules = doc.querySelectorAll('.cs-content-section'),
      modulesCount = modules.length,
      moduleHTMLContent, contentTextArea, expandButton, module, moduleHeader, moduleContent, wrap, i, contentLabel, genSlug;

  if( modulesCount ) {

    for ( i = 0; i < modulesCount; i = i + 1 ) {

      module = modules[i];

      if( module.classList.contains('generate-html') ) {

        genSlug = Corkscrew.generateSlug('elem-');
        moduleHeader = module.querySelectorAll('.cs-content-header')[0];
        moduleContent = module.querySelectorAll('.cs-content')[0];
        moduleHTMLContent = moduleContent.innerHTML;
        wrap = doc.createElement("div");
        expandButton = doc.createElement("button");
        contentTextArea = doc.createElement("textarea");
        contentLabel = doc.createElement("label");

        expandButton.classList.add('cs-button');
        expandButton.classList.add('cs-button-html');
        expandButton.setAttribute('type', 'button');
        expandButton.innerHTML = "View HTML";
        wrap.classList.add('cs-view-html');
        contentTextArea.setAttribute("class", "cs-code-block");

        contentTextArea.setAttribute("id", genSlug);
        contentTextArea.setAttribute("name", genSlug);
        contentLabel.setAttribute("for", genSlug);
        contentLabel.setAttribute("class", "cs-is-hidden");

        contentLabel.innerHTML = "HTML Content for this Module";

        contentTextArea.innerHTML = moduleHTMLContent.replace(/^(\r\n)|(\n)/,'').replace(/^(\r\n)|(\n)/,'');
        contentTextArea.classList.add('cs-is-hidden');
        contentTextArea.spellcheck = false;
        contentTextArea.disabled = true;

        moduleHeader.appendChild(contentLabel);
        moduleHeader.appendChild(expandButton);
        wrap.appendChild(contentTextArea);

        moduleHeader.appendChild(wrap);

        expandButton.addEventListener('click', function(){

          var toggleElem = this.parentNode.querySelectorAll('.cs-code-block')[0];

          if( toggleElem.classList.contains('cs-is-hidden') ) {
            toggleElem.classList.remove('cs-is-hidden');
          } else {
            toggleElem.classList.add('cs-is-hidden');
            toggleElem.focus();
          }


        }, false);

      } // if

    } // for

  } // modulesCount

  },

  // Start the application
  Corkscrew.init();

} )( this, this.document );
