import React from 'react';
import PropTypes from 'prop-types';
import {storiesOf} from '@storybook/react';
import {action} from '@storybook/addon-actions';
import {testProps, testEl} from './CreateGroups.test';


function storyProps(props = {}) {
  return {
    ...testProps(),
    onStudentIdsByRoomChanged: action('onStudentIdsByRoomChanged'),
    ...props
  };
}

storiesOf('reading/CreateGroups', module) // eslint-disable-line no-undef
  .add('with state container', () => (
    <StateContainer defaultStudentIdsByRoom={storyProps().studentIdsByRoom}>
      {({studentIdsByRoom, onStudentIdsByRoomChanged}) => (
        testEl(storyProps({
          studentIdsByRoom,
          onStudentIdsByRoomChanged,
          useMockPhoto: true
        }))
      )}
    </StateContainer>
  ))
  .add('mock photo', () => testEl(storyProps()))
  .add('fallback photo', () => testEl(storyProps({useMockPhoto: true})));
  

class StateContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      studentIdsByRoom: props.defaultStudentIdsByRoom
    };

    this.onStudentIdsByRoomChanged = this.onStudentIdsByRoomChanged.bind(this);
  }

  onStudentIdsByRoomChanged({studentIdsByRoom}) {
    this.setState({studentIdsByRoom});
  }

  render() {
    const {children} = this.props;
    const {studentIdsByRoom} = this.state;
    return children({
      studentIdsByRoom,
      onStudentIdsByRoomChanged: this.onStudentIdsByRoomChanged
    });
  }
}
StateContainer.propTypes = {
  defaultStudentIdsByRoom: PropTypes.any,
  children: PropTypes.func.isRequired
};
