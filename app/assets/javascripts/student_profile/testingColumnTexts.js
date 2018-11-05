import _ from 'lodash';
import {toMoment} from './QuadConverter';
import {shortLabelFromNextGenMcasScore, shortLabelFromOldMcasScore} from '../helpers/mcasScores';


export function interpretEla(nowMoment, chartData) {
  return (
    latestMcasScoreSummary(chartData.next_gen_mcas_ela_scaled, shortLabelFromNextGenMcasScore, nowMoment) ||
    latestMcasScoreSummary(chartData.mcas_series_ela_scaled, shortLabelFromOldMcasScore, nowMoment) ||
    missingMcasSummary()
  );
}

export function interpretMath(nowMoment, chartData) {
  return (
    latestMcasScoreSummary(chartData.next_gen_mcas_mathematics_scaled, shortLabelFromNextGenMcasScore, nowMoment) ||
    latestMcasScoreSummary(chartData.mcas_series_math_scaled, shortLabelFromOldMcasScore, nowMoment) ||
    missingMcasSummary()
  );
}


// Look at ELA and Math next gen MCAS scores and make the different texts for the 'testing'
// column summary for HS.  If those don't exist, fall back to old-school MCAS.
export default function testingColumnTexts(nowMoment, chartData) {
  const ela = interpretEla(nowMoment, chartData);
  const math = interpretMath(nowMoment, chartData);

  const scoreText = ela.scoreText === math.scoreText
    ? ela.scoreText
    : `${ela.scoreText} / ${math.scoreText}`;
  const testText = ela.scoreText === math.scoreText
    ? 'ELA and Math MCAS'
    : 'ELA / Math MCAS';
  const dateText = (ela.dateText === math.dateText)
    ? ela.dateText
    : `${ela.dateText} / ${math.dateText}`;

  return {scoreText, testText, dateText};
}

// Make text for the score and date for the latest MCAS score (either next gen
// or old, depending on `scoreTextFn`).
function latestMcasScoreSummary(quads, scoreTextFn, nowMoment) {
  const latestEla = _.last(_.sortBy(quads || [], quad => toMoment(quad).unix()));
  if (!latestEla) return null;

  const scoreText = scoreTextFn(latestEla[3]);
  const dateText = toMoment(latestEla).from(nowMoment);
  return {scoreText, dateText};
}

function missingMcasSummary() {
  const scoreText = '-';
  const dateText = 'not yet taken';
  return {scoreText, dateText};
}
