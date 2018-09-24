import {
  prettyEnglishProficiencyText
} from './language';


function nullAccess() {
  return {
    "composite":  null,
    "comprehension": null,
    "literacy": null,
    "oral": null,
    "listening": null,
    "reading": null,
    "speaking": null,
    "writing": null
  };
}

function accessWithComposite(performanceLevel) {
  return {
    "composite": {
      "performance_level": performanceLevel,
      "date_taken": "2018-02-24T11:03:06.123Z"
    },
    "comprehension": null,
    "literacy": {
      "performance_level": "3.1",
      "date_taken": "2018-02-24T11:03:06.123Z"
    },
    "oral": {
      "performance_level": "5.2",
      "date_taken": "2018-02-24T11:03:06.123Z"
    },
    "listening": null,
    "reading": null,
    "speaking": null,
    "writing": null
  };
}

it('#prettyEnglishProficiencyText', () => {
  expect(prettyEnglishProficiencyText('Limited', accessWithComposite(1.2))).toEqual('Entering English (1)');
  expect(prettyEnglishProficiencyText('Limited', accessWithComposite(2.1))).toEqual('Emerging English (2)');
  expect(prettyEnglishProficiencyText('Limited', accessWithComposite(3.5))).toEqual('Developing English (3)');
  expect(prettyEnglishProficiencyText('Limited', accessWithComposite(4.7))).toEqual('Expanding English (4)');
  expect(prettyEnglishProficiencyText('Limited', accessWithComposite(5.4))).toEqual('Bridging English (5)');
  expect(prettyEnglishProficiencyText('Limited', accessWithComposite(6))).toEqual('Reaching English (6)');
  expect(prettyEnglishProficiencyText('Limited', nullAccess())).toEqual('Limited English');
});
