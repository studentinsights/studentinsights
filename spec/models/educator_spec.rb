require 'rails_helper'

RSpec.describe Educator do

  describe 'has Devise hooks' do
    it 'allow writing password but not reading, only for Devise' do
      educator = FactoryBot.build(:educator)
      educator.password = 'foo'
      expect(educator.respond_to?(:password)).to eq false
      expect(educator.attributes.has_key?(:password)). to eq false
    end

    it 'allow writing login_text but not reading, only for Devise' do
      educator = FactoryBot.build(:educator)
      educator.login_text = 'foo'
      expect(educator.respond_to?(:login_text)).to eq false
      expect(educator.attributes.has_key?(:login_text)). to eq false
    end
  end

  describe '#as_json' do
    it 'does not include student_searchbar_json' do
      educator = FactoryBot.build(:educator)
      expect(educator.as_json.has_key?('student_searchbar_json')).to be false
    end
  end

  it 'allows creating Educator without a school, so we can whitelist import admin users outside pilot schools' do
    expect(FactoryBot.build(:educator, school: nil)).to be_valid
  end

  describe 'grade_level_access' do
    context 'mix of strings and not strings' do
      let(:educator) { FactoryBot.create(:educator, grade_level_access: ['3', 4]) }
      it 'is coerced into an array of strings' do
        expect(educator.grade_level_access).to eq ["3", "4"]
      end
    end
    context 'only integers' do
      let(:educator) { FactoryBot.create(:educator, grade_level_access: [3, 4]) }
      it 'is coerced into an array of strings' do
        expect(educator.grade_level_access).to eq ["3", "4"]
        expect(educator.valid?).to eq true
      end
    end

    it 'requires grade_level_access to be valid GRADE_LEVEL values' do
      educator = FactoryBot.build(:educator)
      educator.grade_level_access = ['3', '14']
      educator.valid?
      expect(educator.errors.details).to eq(grade_level_access: [{:error=>"invalid grade"}])
    end

    it 'requires grade_level_access to have unique values' do
      educator = FactoryBot.build(:educator)
      educator.grade_level_access = ['2', '2']
      educator.valid?
      expect(educator.errors.details).to eq(grade_level_access: [{:error=>"duplicate values"}])
    end

    it 'requires grade_level_access to be an array' do
      educator = FactoryBot.build(:educator)
      educator.grade_level_access = false
      educator.valid?
      expect(educator.errors.details).to eq(grade_level_access: [{:error=>"should be an array, containing strings"}])
    end

    it 'requires grade_level_access to be present' do
      educator = FactoryBot.build(:educator)
      educator.grade_level_access = nil
      educator.valid?
      expect(educator.errors.details).to eq(grade_level_access: [{:error=>"cannot be nil"}])
    end
  end

  describe '#is_authorized_for_student' do
    let(:authorized?) { educator.is_authorized_for_student(student) }
    let(:healey) { FactoryBot.create(:healey) }
    let(:brown) { FactoryBot.create(:brown) }

    context 'educator has districtwide access' do
      let(:student) { FactoryBot.create(:student, school: healey) }
      let(:educator) {
        FactoryBot.create(:educator, school: brown, districtwide_access: true)
      }

      it 'grants access despite student being from different school' do
        expect(authorized?).to be true
      end
    end

    context 'student belongs to same school' do
      let(:student) { FactoryBot.create(:student, school: healey) }

      context 'educator does not have schoolwide access' do
        let(:educator) { FactoryBot.create(:educator, school: healey) }
        it 'is not authorized' do
          expect(authorized?).to be false
        end
      end

      context 'educator has schoolwide access' do
        let(:educator) { FactoryBot.create(:educator, school: healey, schoolwide_access: true) }
        it 'is authorized' do
          expect(authorized?).to be true
        end
      end

      context 'educator has student in a section' do
        let!(:educator) { FactoryBot.create(:educator, school: healey) }
        let!(:course) { FactoryBot.create(:course) }
        let!(:section) { FactoryBot.create(:section, course: course) }
        let!(:esa) { FactoryBot.create(:educator_section_assignment, educator: educator, section: section) }
        let!(:ssa) { FactoryBot.create(:student_section_assignment, student: student, section: section) }

        it 'is authorized' do
          expect(authorized?).to be true
        end
      end

    end

    context 'student belongs to different school' do
      let(:educator) { FactoryBot.create(:educator, school: healey, schoolwide_access: true) }
      let(:student) { FactoryBot.create(:student, school: brown) }

      it 'is not authorized' do
        expect(authorized?).to be false
      end
    end

  end

  describe 'validations' do
    it 'requires email' do
      expect(FactoryBot.build(:educator, email: nil)).to be_invalid
    end

    describe 'when "restriction" fields are interpreted as limitations on "admin"' do
      context 'admin with access to all students' do
        let(:admin) { FactoryBot.build(:educator, :admin) }
        it 'is valid' do
          expect(admin).to be_valid
        end
      end
      context 'admin without access to all students' do
        let(:admin) { FactoryBot.build(:educator, :admin, restricted_to_sped_students: true) }
        it 'is invalid' do
          expect(admin).to be_invalid
        end
      end
    end
  end

  describe '#labels' do
    let!(:pals) { TestPals.create! }
    it 'works' do
      expect(pals.shs_bill_nye.labels).to eq [
        'should_show_levels_shs_link',
        'should_show_low_grades_box',
        'shs_experience_team'
      ]
      expect(pals.shs_jodi.labels).to eq [
        'can_upload_student_voice_surveys',
        'should_show_levels_shs_link',
        'shs_experience_team'
      ]
      expect(pals.uri.labels).to contain_exactly(*[
        'can_upload_student_voice_surveys',
        'enable_equity_experiments',
        'enable_reader_profile_january',
        'enable_reading_benchmark_data_entry',
        'enable_reading_debug',
        'enable_reflection_on_notes_patterns',
        'enable_viewing_educators_with_access_to_student',
        'profile_enable_minimal_reading_data',
        'should_show_levels_shs_link'
      ])
    end
  end

  describe '#active' do
    let!(:pals) { TestPals.create! }

    it 'looks at missing_from_last_export' do
      pals.rich_districtwide.update!(missing_from_last_export: true)
      expect(pals.rich_districtwide.active?).to eq false
    end

    it 'supports whitelist' do
      pals.rich_districtwide.update!(missing_from_last_export: true)

      mock_per_district = PerDistrict.new
      allow(mock_per_district).to receive(:educator_login_names_whitelisted_as_active).and_return(['rich'])
      allow(PerDistrict).to receive(:new).and_return(mock_per_district)
      expect(pals.rich_districtwide.active?).to eq true
    end
  end
end
