require 'rails_helper'

RSpec.describe EducatorSectionAssignmentRow do

  describe '#build' do

    let(:educator_section_assignment_row) { described_class.new(row) }
    let(:educator_section_assignment) { educator_section_assignment_row.build }

    context 'happy path' do
      let!(:section) { FactoryGirl.create(:section) }
      let!(:educator) { FactoryGirl.create(:educator) }
      let(:row) { { local_id: educator.local_id,
                    section_number: section.section_number,
                } }

      it 'assigns info correctly' do
        expect(educator_section_assignment.educator).to eq educator
        expect(educator_section_assignment.section).to eq section
      end
    end
  end
end
