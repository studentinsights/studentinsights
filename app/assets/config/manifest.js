// This is the entrypoint for the Rails asset pipeline, and is new
// as part of Sprockets 4.0.  See https://github.com/rails/sprockets/blob/master/UPGRADING.md#manifestjs


// Most JS is built separately, and most styles are defined in JS, but this
// is the entry point for some older code still processed by the asset pipeline.
//= link_tree ../images
//= link application.js
//= link application.css

// This is required for the `administrate` gem to work correctly, which
// provides some of the `admin` routes, controllers and views.`
//= link administrate/application.js
//= link administrate/application.css
