import {
  shortLabelFromNextGenMcasScore,
  shortLabelFromOldMcasScore
} from './mcasScores';


describe('#shortLabelFromNextGenMcasScore', () => {
  it('works', () => {
    expect(shortLabelFromNextGenMcasScore(412)).toEqual('NM');
    expect(shortLabelFromNextGenMcasScore(450)).toEqual('PM');
    expect(shortLabelFromNextGenMcasScore(504)).toEqual('M');
    expect(shortLabelFromNextGenMcasScore(551)).toEqual('E');
  });
});

describe('#shortLabelFromOldMcasScore', () => {
  it('works', () => {
    expect(shortLabelFromOldMcasScore(202)).toEqual('W');
    expect(shortLabelFromOldMcasScore(224)).toEqual('NI');
    expect(shortLabelFromOldMcasScore(246)).toEqual('P');
    expect(shortLabelFromOldMcasScore(268)).toEqual('A');
  });
});
