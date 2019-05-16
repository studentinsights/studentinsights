require 'rails_helper'

RSpec.describe EducatorSearchbar do
  describe '.names_for_json' do
    let!(:pals) { TestPals.create! }

    it 'works for two TestPals as test cases' do
      expect(EducatorSearchbar.names_for_json(pals.uri)).to eq([
        { 'label' =>"Garfield Skywalker - HEA - KF", 'id' => pals.healey_kindergarten_student.id },
        { 'label' =>"Ryan Rodriguez - WSNS - 8", 'id' => pals.west_eighth_ryan.id },
        { 'label' =>"Mari Kenobi - SHS - 9", 'id' => pals.shs_freshman_mari.id },
        { 'label' =>"Amir Solo - SHS - 9", 'id' => pals.shs_freshman_amir.id },
        { 'label' =>"Kylo Ren - SHS - 12", 'id' => pals.shs_senior_kylo.id }
      ])
      expect(EducatorSearchbar.names_for_json(pals.healey_vivian_teacher)).to eq([
        { 'label' =>"Garfield Skywalker - HEA - KF", 'id' => pals.healey_kindergarten_student.id }
      ])
    end
  end

  describe '.update_student_searchbar_json! and .student_searchbar_json_for' do
    context 'educator has permissions for a few students' do
      let(:school) { FactoryBot.create(:school, local_id: 'Big River High') }
      let!(:betsy) { FactoryBot.create(:student, first_name: 'Betsy', last_name: 'Ramirez', school: school, grade: '3') }
      let!(:bettina) { FactoryBot.create(:student, first_name: 'Bettina', last_name: 'Abbas', school: school, grade: '3') }
      let(:educator) { FactoryBot.create(:educator, districtwide_access: true) }

      it 'saves the correct JSON' do
        json = EducatorSearchbar.update_student_searchbar_json!(educator)
        expect(json).to contain_exactly(*[
          { "id" => betsy.id, "label" => "Betsy Ramirez - Big River High - 3" },
          { "id" => bettina.id, "label" => "Bettina Abbas - Big River High - 3" }
        ])
        expect(EducatorSearchbar.student_searchbar_json_for(educator)).to eq([
          { "id" => betsy.id, "label" => "Betsy Ramirez - Big River High - 3" },
          { "id" => bettina.id, "label" => "Bettina Abbas - Big River High - 3" }
        ])
      end
    end

    context 'educator has permissions for no students' do
      let(:educator) { FactoryBot.create(:educator) }

      it 'saves the correct JSON' do
        json = EducatorSearchbar.update_student_searchbar_json!(educator)
        expect(json).to eq([])
        expect(EducatorSearchbar.student_searchbar_json_for(educator)).to eq([])
      end
    end
  end

  describe '.student_searchbar_json_for with compute_if_missing:true' do
    let(:school) { FactoryBot.create(:school, local_id: 'Big River High') }
    let!(:betsy) { FactoryBot.create(:student, first_name: 'Betsy', last_name: 'Ramirez', school: school, grade: '3') }
    let(:educator) { FactoryBot.create(:educator, districtwide_access: true) }

    it 'returns empty when not computed, and computes if asked' do
      expect(EducatorSearchbar.student_searchbar_json_for(educator)).to eq []
      expect(EducatorSearchbar.student_searchbar_json_for(educator, compute_if_missing: true)).to eq([
        { "id" => betsy.id, "label" => "Betsy Ramirez - Big River High - 3" }
      ])
    end
  end
end
