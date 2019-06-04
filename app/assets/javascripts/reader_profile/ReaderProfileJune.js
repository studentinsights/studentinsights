import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {apiFetchJson} from '../helpers/apiFetchJson';
import {toMomentFromTimestamp} from '../helpers/toMoment';
import Hover from '../components/Hover';
import GenericLoader from '../components/GenericLoader';
import SectionHeading from '../components/SectionHeading';
import {
  DIBELS_LNF,
  DIBELS_PSF,
  DIBELS_NWF_CLS,
  DIBELS_NWF_WWR,
  DIBELS_DORF_ACC,
  DIBELS_DORF_WPM
} from '../reading/thresholds';
import {
  buildLunrIndexForNotes,
  findNotes,
  SEE_AS_READER_SEARCH,
  ORAL_LANGUAGE_SEARCH,
  ENGLISH_SEARCH,
  SOUNDS_IN_WORDS_SEARCH,
  SOUNDS_AND_LETTERS_SEARCH
} from './NotesSearchForReading';
import ChipForNotes from './ChipForNotes';
import ChipForLanguage from './ChipForLanguage';
import DibelsDialog from './DibelsDialog';
import ChipForDibels from './ChipForDibels';
import ReaderProfileDialog from './ReaderProfileDialog';
import {Ingredient, Sub, MultipleChips} from './layout';

/* todo
<h1>older grades, or still need to add in somewhere</h1>
<div>3rd, phonics screener: {fade(<a href="https://www.dropbox.com/home/ela%20folder/Small%20Group%20Instruction/Phonics%20Inventories?preview=QuickPhonicsScreener.pdf">Quick Phonics Screener</a>)}</div>
<div>3rd, phonics screener: {fade(<a href="https://www.dropbox.com/home/ela%20folder/Small%20Group%20Instruction/Phonics%20Inventories?preview=Decoding+Survey.pdf">Decoding Screener</a>)}</div>
<h2>other bits</h2>
<div>sped eval from melissa's chart</div>
<div>TOWRE in older grades?</div>
<div>maybe CTOPP naming in older grades (instead of SPS RAN)?</div>
<div>CELF maybe for older grades? speech eval?</div>
<div>working memory: WISC-5 maybe in older grades? not K</div>

review search:
- sight words?
- special education evaluation?
*/


/*
ChipContainer
  onClick
  dialogEl

Freshness
  freshnessKey
  children

Concern
  concernKey
  children

Hover
  hoverEl
  children

TwoLineChip
  firstLine(isSmall)
  secondLine(isSmall)
  
NotesChip
  children
*/
export default class ReaderProfileJune extends React.Component {
  render() {
    const {nowFn, districtKey} = this.context;
    const {
      student,
      access,
      notes,
      currentSchoolYear,
      dataPointsByAssessmentKey
    } = this.props;
    const nowMoment = nowFn();
    const lunrIndex = buildLunrIndexForNotes(notes);

    function chipForNotes(words) {
      // return (
      //   <Layered
      //     tooltip="hi"
      //     chips={}
      
      return (
        <ChipForNotes
          nowMoment={nowMoment}
          matches={findNotes(lunrIndex, notes, words)}
        />
      );
    }

    function chipForLanguage(accessKey) {
      return (
        <ChipForLanguage
          accessKey={accessKey}
          nowMoment={nowMoment}
          districtKey={districtKey}
          student={student}
          access={access}
        />
      );
    }

    function chipForDibels(ingredientName, benchmarkAssessmentKey) {
      return (
        <ReaderProfileDialog
          title={ingredientName}
          content={<DibelsDialog
            benchmarkAssessmentKey={benchmarkAssessmentKey}
            currentSchoolYear={currentSchoolYear}
            dataPointsByAssessmentKey={dataPointsByAssessmentKey}
            currentGrade={student.grade}
          />}
          icon={
            <ChipForDibels
              benchmarkAssessmentKey={benchmarkAssessmentKey}
              student={student}
              nowMoment={nowMoment}
              dataPointsByAssessmentKey={dataPointsByAssessmentKey}
            />
          }
        />
      );
    }

    return (
      <div style={{marginTop: 10}}>
        <Ingredient
          name="See themselves as a reader"
          color="#4db1f0"
          notes={chipForNotes(SEE_AS_READER_SEARCH)}
          subs={[
            <Sub name="in small groups" />,
            <Sub name="independently" />
          ]}
        />

        <Ingredient
          name="Communicate with oral language"
          color="#f06060"
          notes={chipForNotes(ORAL_LANGUAGE_SEARCH)}
          subs={[
            <Sub name="expressive" />,
            <Sub name="receptive" />
          ]}
        />

        <Ingredient
          name="Speak and listen in English"
          color="rgba(140, 17, 140, 0.57)"
          notes={chipForNotes(ENGLISH_SEARCH)}
          subs={[
            <Sub name="spoken"
              screener={chipForLanguage('oral')}
            />,
            <Sub name="written"
              screener={chipForLanguage('literacy')}
            />
          ]}
        />

        <Ingredient
          name="Discriminate Sounds in Words"
          color="rgb(227, 121, 58)"
          notes={chipForNotes(SOUNDS_IN_WORDS_SEARCH)}
          subs={[
            <Sub
              name="blending"
              screener={chipForDibels('blending', DIBELS_PSF)}
            />,
            <Sub name="deleting" />,
            <Sub name="substituting" />
          ]}
        />

        <Ingredient
          name="Represent Sounds with Letters"
          color="rgb(100, 186, 91)"
          isLast={true}
          notes={chipForNotes(SOUNDS_AND_LETTERS_SEARCH)}
          subs={[
            <Sub name="letters"
              screener={chipForDibels('letters', DIBELS_LNF)}
            />,
            <Sub name="accurate"
              screener={chipForDibels('accurate', DIBELS_DORF_ACC)}
            />,
            <Sub name="fluent"
              screener={
                <MultipleChips chips={[
                  chipForDibels('fluent', DIBELS_DORF_WPM),
                  chipForDibels('fluent', DIBELS_NWF_WWR),
                  chipForDibels('fluent', DIBELS_NWF_CLS)
                ]} />
              }
            />,
            <Sub name="spelling" />
          ]}
        />
      </div>
    );
  }
}
ReaderProfileJune.contextTypes = {
  nowFn: PropTypes.func.isRequired,
  districtKey: PropTypes.string.isRequired
};
ReaderProfileJune.propTypes = {
  access: PropTypes.object,
  student: PropTypes.shape({
    id: PropTypes.number.isRequired,
    grade: PropTypes.any.isRequired
  }).isRequired,
  notes: PropTypes.arrayOf(PropTypes.object).isRequired,
  currentSchoolYear: PropTypes.number.isRequired,
  dataPointsByAssessmentKey: PropTypes.object.isRequired
};

