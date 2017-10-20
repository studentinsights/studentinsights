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

//= require env

// third-party:
//= require function-bind-polyfill
//= require jquery
//= require jquery_ujs
//= require jquery-ui
//= require highcharts
//= require js.cookie
//= require classList
//= require d3.v3.min.js
//= require moment.js
//= require sanitize

// provided by react-rails gem, configured in config/initializers/assets.rb
//= require react

//= require ./react-compatibility.js

// react libs
//= require react-classnames
//= require react-input-autosize
//= require react-select
//= require react-modal

// shared across application:
//= require datepicker_config
//= require session_timeout_warning
//= require student_searchbar

//= require ./helpers/react_helpers
//= require ./helpers/feed_helpers
//= require ./helpers/graph_helpers
//= require_tree ./helpers

// shared react components:
//= require ./components/fixed_table
//= require ./components/collapsable_table
//= require_tree ./components

// student profile page:
// pure ui components:
  //= require ./student_profile/help_bubble
  //= require ./student_profile/modal_small_icon
  //= require ./student_profile/quad_converter
  //= require ./student_profile/risk_bubble
  //= require ./student_profile/service_color
  //= require ./student_profile/provided_by_educator_dropdown
  //= require ./student_profile/profile_chart_settings
  //= require ./student_profile/educator
  //= require ./student_profile/datepicker
  //= require ./student_profile/highcharts_wrapper
  //= require ./student_profile/bar_chart_sparkline
  //= require ./student_profile/sparkline
  //= require ./student_profile/scales
  //= require ./student_profile/academic_summary
  //= require ./student_profile/take_notes
  //= require ./student_profile/editable_text_component
  //= require ./student_profile/note_card
  //= require ./student_profile/notes_list
  //= require ./student_profile/services_list
  //= require ./student_profile/record_service
  //= require ./student_profile/summary_list
  //= require ./student_profile/profile_chart
  //= require ./student_profile/profile_bar_chart
  //= require ./student_profile/student_profile_header
  //= require ./student_profile/student_sections_roster
  //= require ./student_profile/pdf/student_profile_pdf
// details:
  //= require ./student_profile/services_details
  //= require ./student_profile/notes_details
  //= require ./student_profile/profile_details
  //= require ./student_profile/attendance_details
  //= require ./student_profile/ela_details
  //= require ./student_profile/math_details
// page:
  //= require ./student_profile/student_profile_page
  //= require_tree ./student_profile
// restricted notes
  //= require ./restricted_notes/restricted_notes_page_container
// bulk services:
  //= require ./service_uploads/service_type_dropdown

//= require_tree ./school_overview
//= require_tree .
