import React from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import _ from 'lodash';
import Button from '../components/Button';


// For picking which educators run groups, and writing a note about the team's
// plan for grouping.
export default function MakePlan({educators, plan, onPlanChanged, onDone}) {
  const {primaryEducatorIds, additionalEducatorIds, planText} = plan;
  const isDisabled = (
    primaryEducatorIds.length === 0 ||
    planText === ''
  );
  return (
    <div className="MakePlan">
      <div>
        <div style={styles.heading}>Who's teaching a primary reading group (eg, XBlock)?</div>
        <Select
          name="select-primary-educators"
          multi
          removeSelected
          value={primaryEducatorIds.map(id => _.find(educators, {id}))}
          valueKey="id"
          labelKey="full_name"
          options={educators}
          onChange={educators => onPlanChanged({...plan, primaryEducatorIds: educators.map(e => e.id)})}
        />
      </div>
      <div>
        <div style={styles.heading}>Any additional groups at other points in the day?</div>
        <div style={{fontSize: 12, padding: 10, paddingLeft: 0, paddingTop: 3}}>
          Some teams start with grouping students based on particular skills like decoding blends, others focus on comprehension skills around inferencing, while others group students at lower F&P levels with reading specialists who can provide more specialized instruction.
        </div>
        <Select
          name="select-additional-educators"
          multi
          removeSelected
          value={additionalEducatorIds.map(id => _.find(educators, {id}))}
          valueKey="id"
          labelKey="full_name"
          options={educators}
          onChange={educators => onPlanChanged({...plan, additionalEducatorIds: educators.map(e => e.id)})}
          />
      </div>
      <div>
        <div style={styles.heading}>What's your plan for creating classroom communitites?</div>
        <div style={{fontSize: 12, padding: 10, paddingLeft: 0, paddingTop: 3}}>
          Some teams start with considering social dynamics, splitting up students who are leaders or who don't work well together.  Others start creating groups with diverse academic strengths.
        </div>
        <div>
          <textarea
            style={styles.textarea}
            rows={8}
            value={planText}
            onChange={event => onPlanChanged({...plan, planText: event.target.value})}
          />
        </div>
      </div>
      <div>
        <Button isDisabled={isDisabled} onClick={onDone}>Next</Button>
      </div>
    </div>
  );
}
MakePlan.propTypes = {
  plan: PropTypes.shape({
    primaryEducatorIds: PropTypes.arrayOf(PropTypes.number).isRequired,
    additionalEducatorIds: PropTypes.arrayOf(PropTypes.number).isRequired,
    planText: PropTypes.string.isRequired
  }).isRequired,
  onPlanChanged: PropTypes.func.isRequired,
  onDone: PropTypes.func.isRequired,
  educators: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    full_name: PropTypes.string.isRequired
  })).isRequired
};


const styles = {
  heading: {
    marginTop: 20
  },
  textarea: {
    border: '1px solid #ccc',
    width: '100%'
  }
};
