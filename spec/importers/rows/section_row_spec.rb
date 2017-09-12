require 'rails_helper'

RSpec.describe SectionRow do

  describe '#build' do

    let(:section_row) { described_class.new(row) }
    let(:section) { section_row.build }

    context 'happy path' do
      let(:row) { { course_number:'ART-205',
                    course_description:'Handmade Ceramics I',
                    section_number:'ART-205B',
                    term_local_id:'FY',
                    section_schedule:'3(M-R)',
                    section_room_number:'232B'
                } }

      it 'assigns info correctly' do
        expect(section.section_number).to eq 'ART-205B'
        expect(section.term_local_id).to eq 'FY'
        expect(section.schedule).to eq '3(M-R)'
        expect(section.room_number).to eq '232B'
      end
    end
  end
end
