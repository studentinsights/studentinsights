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

// student profile page v2:
// components:
  //= require ./student/profile_charts/profile_chart_settings
  //= require ./student_profile_v2/educator
  //= require ./student_profile_v2/highcharts_wrapper
  //= require ./student_profile_v2/sparkline
  //= require ./student_profile_v2/scales
  //= require ./student_profile_v2/quad_converter
  //= require ./student_profile_v2/academic_summary
  //= require ./student_profile_v2/take_notes
  //= require ./student_profile_v2/record_service
  //= require ./student_profile_v2/summary_list
  //= require ./student_profile_v2/service_color
  //= require ./student_profile_v2/profile_chart.js
  //= require ./student_profile_v2/student_profile_header
// details:
  //= require ./student_profile_v2/profile_details
  //= require ./student_profile_v2/attendance_details
  //= require ./student_profile_v2/ela_details
  //= require ./student_profile_v2/math_details
  //= require ./student_profile_v2/interventions_details
// page:
  //= require ./student_profile_v2/student_profile_v2_page
  //= require_tree ./student_profile_v2

//= require_tree ./student
//= require_tree ./roster
//= require_tree ./school_overview
//= require_tree ./school_star
