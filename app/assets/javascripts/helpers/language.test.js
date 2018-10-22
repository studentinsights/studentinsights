import {
  hasAnyAccessData,
  prettyEnglishProficiencyText,
  roundedWidaLevel,
  englishProficiencyOptions
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

it('#hasAnyAccessData', () => {
  expect(hasAnyAccessData(nullAccess())).toEqual(false);
  expect(hasAnyAccessData(accessWithComposite(3.2))).toEqual(true);
});

// This is more exhaustively tested in UI snapshot tests
describe('#prettyEnglishProficiencyText', () => {
  it('works for Limited in Somerville', () => {
    expect(prettyEnglishProficiencyText('somerville', 'Limited', { access: accessWithComposite(1.2) })).toEqual('English Learner, level 1');
    expect(prettyEnglishProficiencyText('somerville', 'Limited', { access: accessWithComposite(2.1) })).toEqual('English Learner, level 2');
    expect(prettyEnglishProficiencyText('somerville', 'Limited', { access: accessWithComposite(3.5) })).toEqual('English Learner, level 3');
    expect(prettyEnglishProficiencyText('somerville', 'Limited', { access: accessWithComposite(4.7) })).toEqual('English Learner, level 4');
    expect(prettyEnglishProficiencyText('somerville', 'Limited', { access: accessWithComposite(5.4) })).toEqual('English Learner, level 5');
    expect(prettyEnglishProficiencyText('somerville', 'Limited', { access: accessWithComposite(6) })).toEqual('English Learner, level 6');
    expect(prettyEnglishProficiencyText('somerville', 'Limited', { access: nullAccess() })).toEqual('English Learner');
  });

  it('shows FLEP transition date if possible in Somerville', () => {
    expect(prettyEnglishProficiencyText('somerville', 'FLEP', { ellTransitionDate: '2017-06-28' })).toEqual('Former English Learner, since 6/2017');
    expect(prettyEnglishProficiencyText('somerville', 'FLEP', { ellTransitionDate: null })).toEqual('Former English Learner');
    expect(prettyEnglishProficiencyText('somerville', 'FLEP')).toEqual('Former English Learner');
  });
});


describe('#roundedWidaLevel', () => {
  it('works', () => {
    expect(roundedWidaLevel(4)).toEqual(4);
    expect(roundedWidaLevel(4.1)).toEqual(4);
    expect(roundedWidaLevel(4.7)).toEqual(4);
  });

  it('allows fractional renderings for specific tests', () => {
    expect(roundedWidaLevel(3.1, {shouldRenderFractions: true})).toEqual(3.0);
    expect(roundedWidaLevel(3.7, {shouldRenderFractions: true})).toEqual(3.5);
  });
});

describe('#englishProficiencyOptions', () => {
  it('works for Somerville', () => {
    expect(englishProficiencyOptions('somerville')).toEqual([
      {"label": "All", "value": "ALL"},
      {"label": "English Learner", "value": "Limited"},
      {"label": "Former English Learner", "value": "FLEP"},
      {"label": "Fluent English", "value": "Fluent"}
    ]);
  });
});
