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

// rollbar reports errors in production, so load it first
// but first it needs our application's Env config to know which environment
// we're in
//= require env
//= require rollbar

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
//= require datepicker_config
//= require session_timeout_warning
//= require student_searchbar

//= require ./helpers/react_helpers
//= require ./helpers/feed_helpers
//= require_tree ./helpers

// shared react compoents:
//= require ./components/fixed_table
//= require ./components/collapsable_table
//= require_tree ./components

// student profile page:
// pure ui components:
  //= require ./student_profile/risk_bubble
  //= require ./student_profile/service_color
  //= require ./student_profile/profile_chart_settings
  //= require ./student_profile/educator
  //= require ./student_profile/datepicker
  //= require ./student_profile/highcharts_wrapper
  //= require ./student_profile/sparkline
  //= require ./student_profile/quad_converter
  //= require ./student_profile/scales
  //= require ./student_profile/academic_summary
  //= require ./student_profile/take_notes
  //= require ./student_profile/notes_list
  //= require ./student_profile/services_list
  //= require ./student_profile/record_service
  //= require ./student_profile/summary_list
  //= require ./student_profile/profile_chart
  //= require ./student_profile/profile_bar_chart
  //= require ./student_profile/student_profile_header
// details:
  //= require ./student_profile/profile_details
  //= require ./student_profile/attendance_details
  //= require ./student_profile/ela_details
  //= require ./student_profile/math_details
  //= require ./student_profile/interventions_details
// page:
  //= require ./student_profile/student_profile_page
  //= require_tree ./student_profile

//= require_tree ./roster
//= require_tree ./school_overview
//= require_tree .
