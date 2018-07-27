import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import renderer from 'react-test-renderer';
import {withDefaultNowContext} from '../testing/NowContainer';
import {studentProfile, nowMoment} from './fixtures/fixtures';
import serializedDataForOlafWhite from './fixtures/serializedDataForOlafWhite.fixture';
import serializedDataForPlutoPoppins from './fixtures/serializedDataForPlutoPoppins.fixture';
import serializedDataForAladdinMouse from './fixtures/serializedDataForAladdinMouse.fixture';
import {initialState} from './PageContainer';
import StudentProfilePage from './StudentProfilePage';


export function testPropsForOlafWhite() {
  return testPropsFromSerializedData(serializedDataForOlafWhite);
}

export function testPropsForPlutoPoppins() {
  return testPropsFromSerializedData(serializedDataForPlutoPoppins);
}

export function testPropsForAladdinMouse() {
  return testPropsFromSerializedData(serializedDataForAladdinMouse);
}

function testSerializedData(patches) {
  const {
    grade,
    dibels,
    absencesCount,
    sectionsCount,
    schoolType,
    educatorLabels,
    spedLiaison
  } = patches;
  const serializedData = _.cloneDeep(studentProfile);

  if (spedLiaison !== undefined) {
    serializedData["student"]["sped_liaison"] = spedLiaison;
  }

  if (educatorLabels !== undefined) {
    serializedData["currentEducator"]["labels"] = educatorLabels;
  }

  if (grade !== undefined) {
    serializedData["student"]["grade"] = grade;
  }

  if (dibels !== undefined) {
    serializedData["dibels"] = dibels;
  }

  if (absencesCount !== undefined) {
    serializedData["student"]["absences_count"] = absencesCount;
  }

  if (sectionsCount !== undefined) {
    const sections = _.times(sectionsCount, function(n) {
      return {id: n+1};
    });
    serializedData["sections"] = sections;
  }

  if (schoolType !== undefined) {
    serializedData["student"]["school_type"] = schoolType;
  }

  return serializedData;
}

function testPropsFromPatches(patches = {}) {
  return testPropsFromSerializedData(testSerializedData(patches));
}

function testPropsFromSerializedData(serializedData, queryParams = {}) {
  return {
    ...initialState({serializedData, queryParams}),
    nowMomentFn() { return nowMoment; },
    actions: {
      onColumnClicked: jest.fn(),
      onClickSaveNotes: jest.fn(),
      onClickSaveTransitionNote: jest.fn(),
      onDeleteEventNoteAttachment: jest.fn(),
      onClickSaveService: jest.fn(),
      onClickDiscontinueService: jest.fn(),
      onChangeNoteInProgressText: jest.fn(),
      onClickNoteType: jest.fn(),
      onChangeAttachmentUrl: jest.fn()
    },
    districtKey: 'somerville'
  };
}

function testRender(props) {
  const el = document.createElement('div');
  ReactDOM.render(withDefaultNowContext(<StudentProfilePage {...props} />), el);
  return {el};
}

function renderedTextWithPatches(patches = {}) {
  const props = testPropsFromPatches(patches);
  const {el} = testRender(props);
  return $(el).text();
}

describe('transition notes', () => {
  it('renders for k8_counselor', () => {
    expect(renderedTextWithPatches({
      grade: '8',
      educatorLabels: ['k8_counselor']
    })).toContain('High School Transition Note');
  });

  it('renders for high_school_house_master', () => {
    expect(renderedTextWithPatches({
      grade: '8',
      educatorLabels: ['high_school_house_master']
    })).toContain('High School Transition Note');
  });

  it('does not renders for 7th grader', () => {
    expect(renderedTextWithPatches({
      grade: '7',
      educatorLabels: ['k8_counselor', 'high_school_house_master']
    })).not.toContain('High School Transition Note');
  });

  it('does not renders for 9th grader', () => {
    expect(renderedTextWithPatches({
      grade: '9',
      educatorLabels: ['k8_counselor', 'high_school_house_master']
    })).not.toContain('High School Transition Note');
  });
});

describe('SPED liaison', () => {
  it('renders with serializedDataForPlutoPoppins', () => {
    const {el} = testRender(testPropsForPlutoPoppins());
    expect($(el).text()).toContain('Sp Ed');
    expect($(el).text()).toContain('Partial Inclusion');
    expect($(el).text()).toContain('2-5 hours / week');
    expect($(el).text()).toContain('SPED Liaison');
    expect($(el).text()).toContain('CONCEPCION');
  });

  it('does not render with serializedDataForOlafWhite', () => {
    const {el} = testRender(testPropsForOlafWhite());
    expect($(el).text()).not.toContain('SPED Liaison');
  });
});

describe('renders attendance event summaries correctly', () => {

  describe('student with no absences this school year', () => {
    it('displays zero absences', () => {
      const props = testPropsFromPatches({
        grade: null,
        dibels: [],
        absencesCount: 0
      });
      const {el} = testRender(props);
      expect($(el).text()).toContain('Absences this school year:0');
    });
  });

  describe('student with 15 absences this school year', () => {
    it('displays 15 absences', () => {
      const props = testPropsFromPatches();
      const {el} = testRender(props);
      expect($(el).text()).toContain('Absences this school year:15');
    });
  });

});

describe('renders MCAS/DIBELS correctly according to grade level', () => {

  describe('student in grade 3', () => {

    describe('student with DIBELS result', () => {
      it('renders the latest DIBELS', () => {
        const props = testPropsFromPatches({
          grade: '3',
          dibels: [{ 'performance_level': 'INTENSIVE '}]
        });
        const {el} = testRender(props);
        expect($(el).text()).not.toContain('MCAS ELA SGP');
        expect($(el).text()).toContain('DIBELS');
        expect($(el).text()).toContain('INTENSIVE');
      });

    });

    describe('student without DIBELS result', () => {
      it('renders MCAS ELA SGP', () => {
        const props = testPropsFromPatches({
          grade: '3',
          dibels: []
        });
        const {el} = testRender(props);
        expect($(el).text()).toContain('MCAS ELA SGP');
      });
    });

  });

  describe('student in grade 5', () => {

    describe('student with DIBELS result', () => {
      it('renders MCAS ELA SGP', () => {
        const props = testPropsFromPatches({
          grade: '5',
          dibels: [{ 'performance_level': 'INTENSIVE '}]
        });
        const {el} = testRender(props);
        expect($(el).text()).toContain('MCAS ELA SGP');
      });
    });

    describe('student without DIBELS result', () => {
      it('renders MCAS ELA SGP', () => {
        const props = testPropsFromPatches({
          grade: '5',
          dibels: []
        });
        const {el} = testRender(props);
        expect($(el).text()).toContain('MCAS ELA SGP');
      });
    });

    describe('student with sections', () => {
      it('does not have sections count', () => {
        const props = testPropsFromPatches({
          grade: '5',
          dibels: [],
          absencesCount: 0,
          sectionsCount: 3,
          schoolType: 'ES'
        });
        const {el} = testRender(props);
        expect($(el).text()).not.toContain('Sections');
      });
    });
  });

  describe('student in high school', () => {
    it('renders student with 1 section', () => {
      const props = testPropsFromPatches({
        grade: '10',
        dibels: [],
        absencesCount: 0,
        sectionsCount: 1,
        schoolType: 'HS'
      });
      const {el} = testRender(props);
      expect($(el).text()).toContain('1 section');
    });

    it('renders student with 5 sections', () => {
      const props = testPropsFromPatches({
        grade: '10',
        dibels: [],
        absencesCount: 0,
        sectionsCount: 5,
        schoolType: 'HS'
      });
      const {el} = testRender(props);
      expect($(el).text()).toContain('5 sections');
    });
  });
});


describe('snapshots', () => {
  function expectSnapshot(props) {
    const tree = renderer
      .create(withDefaultNowContext(<StudentProfilePage {...props} />))
      .toJSON();
    expect(tree).toMatchSnapshot();
  }

  it('works for olaf', () => expectSnapshot(testPropsForOlafWhite()));
  it('works for pluto', () => expectSnapshot(testPropsForPlutoPoppins()));
  it('works for aladdin', () => expectSnapshot(testPropsForAladdinMouse()));
});