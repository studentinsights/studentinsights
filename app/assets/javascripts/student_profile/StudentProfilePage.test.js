import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import {studentProfile, nowMoment} from './fixtures';
import mockHistory from '../testing/mockHistory';
import PageContainer from './PageContainer';


const helpers = {
  renderStudentProfilePage(params = {}) {
    const {
      el,
      grade,
      dibels,
      absencesCount,
      sectionsCount,
      schoolType,
      educatorLabels,
      spedLiason
    } = params;
    const serializedData = _.cloneDeep(studentProfile);

    if (spedLiason !== undefined) {
      serializedData["student"]["sped_liason"] = spedLiason;
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


    const mergedProps = {
      serializedData: serializedData,
      nowMomentFn() { return nowMoment; },
      queryParams: {},
      history: mockHistory()
    };
    ReactDOM.render(<PageContainer {...mergedProps} />, el);
  }
};

function renderedTextForParams(params) {
  const el = document.createElement('div');
  helpers.renderStudentProfilePage({
    el,
    ...params
  });
  return $(el).text();
}

describe('transition notes', () => {
  it('renders for k8_counselor', () => {
    expect(renderedTextForParams({
      grade: '8',
      educatorLabels: ['k8_counselor']
    })).toContain('High School Transition Note');
  });

  it('renders for high_school_house_master', () => {
    expect(renderedTextForParams({
      grade: '8',
      educatorLabels: ['high_school_house_master']
    })).toContain('High School Transition Note');
  });

  it('does not renders for 7th grader', () => {
    expect(renderedTextForParams({
      grade: '7',
      educatorLabels: ['k8_counselor', 'high_school_house_master']
    })).not.toContain('High School Transition Note');
  });

  it('does not renders for 9th grader', () => {
    expect(renderedTextForParams({
      grade: '9',
      educatorLabels: ['k8_counselor', 'high_school_house_master']
    })).not.toContain('High School Transition Note');
  });
});

describe('SPED liason', () => {
  it('renders when it is present', () => {
    const text = renderedTextForParams({ spedLiason: 'MILNER' });
    expect(text).toContain('SPED Liason');
    expect(text).toContain('MILNER');
  });
});

describe('renders attendance event summaries correctly', () => {

  describe('student with no absences this school year', () => {
    it('displays zero absences', () => {
      const el = document.createElement('div');
      helpers.renderStudentProfilePage({el,
        grade: null,
        dibels: [],
        absencesCount: 0
      });
      expect($(el).text()).toContain('Absences this school year:0');
    });
  });

  describe('student with 15 absences this school year', () => {
    it('displays 15 absences', () => {
      const el = document.createElement('div');
      helpers.renderStudentProfilePage({el});
      expect($(el).text()).toContain('Absences this school year:15');
    });
  });

});

describe('renders MCAS/DIBELS correctly according to grade level', () => {

  describe('student in grade 3', () => {

    describe('student with DIBELS result', () => {
      it('renders the latest DIBELS', () => {
        const el = document.createElement('div');
        helpers.renderStudentProfilePage({
          el,
          grade: '3',
          dibels: [{ 'performance_level': 'INTENSIVE '}]
        });
        expect($(el).text()).not.toContain('MCAS ELA SGP');
        expect($(el).text()).toContain('DIBELS');
        expect($(el).text()).toContain('INTENSIVE');
      });

    });

    describe('student without DIBELS result', () => {
      it('renders MCAS ELA SGP', () => {
        const el = document.createElement('div');
        helpers.renderStudentProfilePage({
          el,
          grade: '3',
          dibels: []
        });
        expect($(el).text()).toContain('MCAS ELA SGP');
      });
    });

  });

  describe('student in grade 5', () => {

    describe('student with DIBELS result', () => {
      it('renders MCAS ELA SGP', () => {
        const el = document.createElement('div');
        helpers.renderStudentProfilePage({
          el,
          grade: '5',
          dibels: [{ 'performance_level': 'INTENSIVE '}]
        });
        expect($(el).text()).toContain('MCAS ELA SGP');
      });
    });

    describe('student without DIBELS result', () => {
      it('renders MCAS ELA SGP', () => {
        const el = document.createElement('div');
        helpers.renderStudentProfilePage({
          el,
          grade: '5',
          dibels: []
        });
        expect($(el).text()).toContain('MCAS ELA SGP');
      });
    });

    describe('student with sections', () => {
      it('does not have sections count', () => {
        const el = document.createElement('div');
        helpers.renderStudentProfilePage({
          el,
          grade: '5',
          dibels: [],
          absencesCount: 0,
          sectionsCount: 3,
          schoolType: 'ES'
        });
        expect($(el).text()).not.toContain('Sections');
      });
    });
  });

  describe('student in high school', () => {
    it('renders student with 1 section', () => {
      const el = document.createElement('div');
      helpers.renderStudentProfilePage({
        el,
        grade: '10',
        dibels: [],
        absencesCount: 0,
        sectionsCount: 1,
        schoolType: 'HS'
      });
      expect($(el).text()).toContain('1 section');
    });

    it('renders student with 5 sections', () => {
      const el = document.createElement('div');
      helpers.renderStudentProfilePage({
        el,
        grade: '10',
        dibels: [],
        absencesCount: 0,
        sectionsCount: 5,
        schoolType: 'HS'
      });
      expect($(el).text()).toContain('5 sections');
    });
  });
});
