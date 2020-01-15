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
    benchmark_data_points: PropTypes.arrayOf(PropTypes.object).isRequired
  }).isRequired,
  instructionalStrategiesJson: PropTypes.array.isRequired,
  onClose: PropTypes.func.isRequired
};