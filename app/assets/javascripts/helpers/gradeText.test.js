import {gradeText} from './gradeText';


describe('#gradeText', () => {
  it('works across values', () => {
    expect(gradeText('K')).toEqual('K');
    expect(gradeText('1')).toEqual('1st grade');
    expect(gradeText('2')).toEqual('2nd grade');
    expect(gradeText('3')).toEqual('3rd grade');
    expect(gradeText('7')).toEqual('7th grade');
  });
});
