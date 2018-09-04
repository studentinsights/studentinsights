import {parseAndReRender} from './transitionNoteParser';

describe('#parseAndReRender', () => {
  it('works', () => {
    const text = (
`What are this student's strengths?
——————————
is awesome.

What is this student's involvement in the school community like?
——————————
plays on sports teams.

How does this student relate to their peers?
——————————
gets along well.

Who is the student's primary guardian?
——————————
mother.
Any additional comments or good things to know about this student?
———————
is good at negotiating for what he wants
Transition comments: Doesn't have concerns`
    );
    expect(parseAndReRender(text)).toEqual(
`What are this student's strengths?
is awesome.

What is this student's involvement in the school community like?
plays on sports teams.

How does this student relate to their peers?
gets along well.

Who is the student's primary guardian?
mother.

Any additional comments or good things to know about this student?
is good at negotiating for what he wants
Transition comments: Doesn't have concerns`
    );
  });
});
