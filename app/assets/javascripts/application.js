// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or vendor/assets/javascripts of plugins, if any, can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file.
//
// Read Sprockets README (https://github.com/sstephenson/sprockets#sprockets-directives) for details
// about supported directives.
//

// third-party:
//= require jquery
//= require jquery_ujs
//= require jquery-ui
//= require highcharts
//= require jquery.tooltipster.min.js
//= require tablesort.min
//= require tablesort.numeric
//= require mustache.min
//= require js.cookie
//= require classList
//= require lodash.3.10.1.min
//= require rounded-corners
//= require handlebars.runtime
//= require d3.v3.min.js
//= require moment.js

// provided by react-rails gem, configured in config/initializers/assets.rb
//= require react

// react libs
//= require react-classnames
//= require react-input-autosize
//= require react-select

// shared across application:
//= require env
//= require datepicker_config
//= require session_timeout_warning
//= require student_searchbar
//= require_tree ./helpers
//= require_tree ./components

// pages:
//= require_tree ./student
//= require ./student_profile_v2/highcharts_wrapper
//= require ./student_profile_v2/scales
//= require ./student_profile_v2/take_notes
//= require ./student_profile_v2/summary_list
//= require ./student_profile_v2/profile_details
//= require_tree ./student_profile_v2
//= require_tree ./roster
//= require_tree ./school_overview
//= require_tree ./school_star
