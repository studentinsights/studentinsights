require 'spec_helper'

RSpec.describe TransitionNoteParser do
  describe '#parse_text' do
    it 'works' do
      text = "What are this student's strengths?  everything!\n\nWhat is this student's involvement in the school community like?  really good\n\n\n\n\nHow does this student relate to their peers? not sure\n\nWho is the student's primary guardian? okay\n\nAny additional comments or good things to know about this student? nope :)"
      expect(TransitionNoteParser.new.parse_text(text)).to eq({
        :strengths => "everything!",
        :community => "really good",
        :peers => "not sure",
        :guardian => "okay",
        :other => "nope :)"
      })
    end
  end
end
