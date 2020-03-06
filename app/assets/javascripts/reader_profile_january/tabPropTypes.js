import PropTypes from 'prop-types';

export default {
  student: PropTypes.shape({
    id: PropTypes.number.isRequired,
    first_name: PropTypes.string.isRequired,
    grade: PropTypes.any.isRequired
  }).isRequired,
  readerJson: PropTypes.shape({
    access: PropTypes.object,
    services: PropTypes.array.isRequired,
    iep_contents: PropTypes.object,
    feed_cards: PropTypes.arrayOf(PropTypes.object).isRequired,
    current_school_year: PropTypes.number.isRequired,
    benchmark_data_points: PropTypes.arrayOf(PropTypes.object).isRequired,
    reading_chart_data: PropTypes.shape({
      star_series_reading_percentile: PropTypes.array.isRequired
    }).isRequired
  }).isRequired,
  onClick: PropTypes.func.isRequired,
  style: PropTypes.object
};