require 'rails_helper'

RSpec.describe PrecomputeSearchbarJson do

  describe '.for' do

    context 'educator has permissions for a few students' do
      let(:school) { FactoryGirl.create(:school, local_id: 'Big River High') }
      let!(:betsy) { FactoryGirl.create(:student, first_name: 'Betsy', last_name: 'Ramirez', school: school, grade: '3') }
      let!(:bettina) { FactoryGirl.create(:student, first_name: 'Bettina', last_name: 'Abbas', school: school, grade: '3') }
      let(:educator) { FactoryGirl.create(:educator, districtwide_access: true) }

      it 'saves the correct JSON' do
        PrecomputeSearchbarJson.new.for(educator)
        expect(educator.student_searchbar_json).to eq(
          "[{\"label\":\"Betsy Ramirez - Big River High - 3\",\"id\":#{betsy.id}},{\"label\":\"Bettina Abbas - Big River High - 3\",\"id\":#{bettina.id}}]"
        )
      end
    end

    context 'educator has permissions for no students' do
      let(:educator) { FactoryGirl.create(:educator) }

      it 'saves the correct JSON' do
        PrecomputeSearchbarJson.new.for(educator)
        expect(educator.student_searchbar_json).to eq("[]")
      end
    end

    context 'multiple districtwide_access educators' do
      let(:school) { FactoryGirl.create(:school, local_id: 'Big River High') }
      let!(:betsy) { FactoryGirl.create(:student, first_name: 'Betsy', last_name: 'Ramirez', school: school, grade: '3') }
      let!(:bettina) { FactoryGirl.create(:student, first_name: 'Bettina', last_name: 'Abbas', school: school, grade: '3') }

      let!(:educator) { FactoryGirl.create(:educator, districtwide_access: true) }
      let!(:another_educator) { FactoryGirl.create(:educator, districtwide_access: true) }

      it 'only calculates districtwide JSON once' do
        expect(SearchbarHelper).to receive(:names_for_all_students).once
        PrecomputeSearchbarJson.new.for_all_educators
      end

    end

  end

end
