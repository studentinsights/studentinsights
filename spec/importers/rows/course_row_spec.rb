require 'rails_helper'

RSpec.describe CourseRow do

  describe '#build' do

    let(:course_row) { described_class.new(row) }
    let(:course) { course_row.build }

    context 'happy path' do
      let(:row) { { course_number:'ART-205',
                    course_description:'Handmade Ceramics I',
                    section_number:'ART-205B',
                    term_local_id:'FY',
                    section_schedule:'3(M-R)',
                    section_room_number:'232B'
                } }

      it 'assigns info correctly' do
        expect(course.course_number).to eq 'ART-205'
        expect(course.course_description).to eq 'Handmade Ceramics I'
      end
    end
  end
end
