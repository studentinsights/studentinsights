import ReactTestUtils from 'react-addons-test-utils';

// Simulates opening the react-select dropdown and clicking the item
// with `optionText`.
export default function changeReactSelect($selectEl, optionText) {
  ReactTestUtils.Simulate.mouseDown($selectEl.find('.Select-arrow-zone').get(0));
  ReactTestUtils.Simulate.focus($selectEl.find('input:last').get(0));
  $selectEl.find('.Select-option:contains(' + optionText + ')').click();
  return undefined;
}