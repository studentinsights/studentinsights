require 'rails_helper'

RSpec.describe EducatorSearchbar do

  describe '#update_student_searchbar_json!' do
    context 'educator has permissions for a few students' do
      let(:school) { FactoryBot.create(:school, local_id: 'Big River High') }
      let!(:betsy) { FactoryBot.create(:student, first_name: 'Betsy', last_name: 'Ramirez', school: school, grade: '3') }
      let!(:bettina) { FactoryBot.create(:student, first_name: 'Bettina', last_name: 'Abbas', school: school, grade: '3') }
      let(:educator) { FactoryBot.create(:educator, districtwide_access: true) }

      it 'saves the correct JSON' do
        EducatorSearchbar.update_student_searchbar_json!(educator)
        json = JSON.parse(educator.student_searchbar_json).as_json
        expect(json).to contain_exactly(*[
          { "id" => betsy.id, "label" => "Betsy Ramirez - Big River High - 3" },
          { "id" => bettina.id, "label" => "Bettina Abbas - Big River High - 3" }
        ])
      end
    end
    context 'educator has permissions for no students' do
      let(:educator) { FactoryBot.create(:educator) }

      it 'saves the correct JSON' do
        EducatorSearchbar.update_student_searchbar_json!(educator)
        expect(educator.student_searchbar_json).to eq("[]")
      end
    end
  end
end
