import React from 'react';
import PropTypes from 'prop-types';
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
import ChipForDibels from './ChipForDibels';
import DibelsDialog from './DibelsDialog';
import CleanSlateFeedView from '../feed/CleanSlateFeedView';
import ReaderProfileDialog from './ReaderProfileDialog';
import {Ingredient, Sub, MultipleChips} from './layout';

/* todo
screeners:
- 3rd, phonics screener: {fade(<a href="https://www.dropbox.com/home/ela%20folder/Small%20Group%20Instruction/Phonics%20Inventories?preview=QuickPhonicsScreener.pdf">Quick Phonics Screener</a>)}</div>
- 3rd, phonics screener: {fade(<a href="https://www.dropbox.com/home/ela%20folder/Small%20Group%20Instruction/Phonics%20Inventories?preview=Decoding+Survey.pdf">Decoding Screener</a>)}</div>

other bits:
- sped eval from melissa's chart
- TOWRE in older grades?
- maybe CTOPP naming in older grades (instead of SPS RAN)?
- CELF maybe for older grades? speech eval?
- working memory: WISC-5 maybe in older grades? not K

review search heuristics:
- sight words?
- special education evaluation?
*/
export default class ReaderProfileJune extends React.Component {
  render() {
    const {feedCards} = this.props;
    const notes = feedCards.map(card => card.json);
    const lunrIndex = buildLunrIndexForNotes(notes);

    return (
      <div style={{marginTop: 10}}>
        <Ingredient
          name="See themselves as a reader"
          color="#4db1f0"
          notes={this.renderChipForNotes(SEE_AS_READER_SEARCH, lunrIndex)}
          subs={[
            <Sub name="in small groups" />,
            <Sub name="independently" />
          ]}
        />

        <Ingredient
          name="Communicate with oral language"
          color="#f06060"
          notes={this.renderChipForNotes(ORAL_LANGUAGE_SEARCH, lunrIndex)}
          subs={[
            <Sub name="expressive" />,
            <Sub name="receptive" />
          ]}
        />

        <Ingredient
          name="Speak and listen in English"
          color="rgba(140, 17, 140, 0.57)"
          notes={this.renderChipForNotes(ENGLISH_SEARCH, lunrIndex)}
          subs={[
            <Sub name="spoken"
              screener={this.renderChipForLanguage('oral')}
            />,
            <Sub name="written"
              screener={this.renderChipForLanguage('literacy')}
            />
          ]}
        />

        <Ingredient
          name="Discriminate Sounds in Words"
          color="rgb(227, 121, 58)"
          notes={this.renderChipForNotes(SOUNDS_IN_WORDS_SEARCH, lunrIndex)}
          subs={[
            <Sub
              name="blending"
              screener={this.renderChipForDibels('blending', DIBELS_PSF)}
            />,
            <Sub name="deleting" />,
            <Sub name="substituting" />
          ]}
        />

        <Ingredient
          name="Represent Sounds with Letters"
          color="rgb(100, 186, 91)"
          isLast={true}
          notes={this.renderChipForNotes(SOUNDS_AND_LETTERS_SEARCH, lunrIndex)}
          subs={[
            <Sub name="letters"
              screener={this.renderChipForDibels('letters', DIBELS_LNF)}
            />,
            <Sub name="accurate"
              screener={this.renderChipForDibels('accurate', DIBELS_DORF_ACC)}
            />,
            <Sub name="fluent"
              screener={
                <MultipleChips chips={[
                  this.renderChipForDibels('fluent', DIBELS_DORF_WPM),
                  this.renderChipForDibels('fluent', DIBELS_NWF_WWR),
                  this.renderChipForDibels('fluent', DIBELS_NWF_CLS)
                ]} />
              }
            />,
            <Sub name="spelling" />
          ]}
        />
      </div>
    );
  }

  renderChipForNotes(words, lunrIndex) {
    const {nowFn} = this.context;
    const {student, feedCards} = this.props;
    const notes = feedCards.map(card => card.json);

    return (
      <ReaderProfileDialog
        title={`Notes for ${student.first_name}`}
        content={<CleanSlateFeedView feedCards={feedCards} style={{fontSize: 14}} />}
        modalStyle={{
          content: {
            right: 40,
            left: 'auto',
            width: '55%',
            top: 40,
            bottom: 40
          }
        }}
        icon={
          <ChipForNotes
            nowMoment={nowFn()}
            matches={findNotes(lunrIndex, notes, words)}
          />
        }
      />
    );
  }

  renderChipForLanguage(accessKey) {
    const {student, access} = this.props;
    return (
      <ChipForLanguage
        accessKey={accessKey}
        student={student}
        access={access}
      />
    );
  }

  renderChipForDibels(ingredientName, benchmarkAssessmentKey) {
    const {
      student,
      currentSchoolYear,
      dataPointsByAssessmentKey
    } = this.props;
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
            dataPointsByAssessmentKey={dataPointsByAssessmentKey}
          />
        }
      />
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
  feedCards: PropTypes.arrayOf(PropTypes.object).isRequired,
  currentSchoolYear: PropTypes.number.isRequired,
  dataPointsByAssessmentKey: PropTypes.object.isRequired
};

