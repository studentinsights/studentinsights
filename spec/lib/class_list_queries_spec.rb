require 'spec_helper'

RSpec.describe ClassListQueries do
  let!(:pals) { TestPals.create! }
  let!(:time_now) { pals.time_now }

  describe '#authorized_students_for_next_year' do
    def authorized_students_for_next_year(educator, school_id, grade_level_next_year)
      ClassListQueries.new(educator).authorized_students_for_next_year(school_id, grade_level_next_year)
    end

    let!(:active_student) do
      FactoryBot.create(:student, {
        grade: '5',
        school: pals.healey,
        homeroom: pals.healey_fifth_homeroom
      })
    end
    let!(:inactive_student) do
      FactoryBot.create(:student, {
        grade: '5',
        enrollment_status: 'Inactive',
        school: pals.healey,
        homeroom: pals.healey_fifth_homeroom
      })
    end

    it 'only returns active students for grade and school' do
      expect(authorized_students_for_next_year(pals.healey_sarah_teacher, pals.healey.id, '5')).to eq []
      expect(authorized_students_for_next_year(pals.healey_sarah_teacher, pals.healey.id, '6')).to eq [active_student]
      expect(authorized_students_for_next_year(pals.west_marcus_teacher, pals.healey.id, '6')).to eq []
    end
  end

  describe '#authorized_class_list' do
    def create_class_list_from(educator, params = {})
      ClassList.create!({
        workspace_id: 'foo-workspace-id',
        created_by_educator_id: educator.id,
        school_id: educator.school_id,
        json: { foo: 'bar' }
      }.merge(params))
    end

    def authorized_class_list(educator, workspace_id)
      ClassListQueries.new(educator).authorized_class_list(workspace_id)
    end

    it 'works for reading own writes' do
      class_list = create_class_list_from(pals.healey_sarah_teacher, grade_level_next_year: '6')
      expect(authorized_class_list(pals.healey_sarah_teacher, 'foo-workspace-id')).to eq class_list
    end

    it 'cannot read writes from other users' do
      create_class_list_from(pals.healey_sarah_teacher, grade_level_next_year: '6')
      expect(authorized_class_list(pals.uri, 'foo-workspace-id')).to eq nil
    end

    it 'can not read incorrect own writes that have different school or grade level' do
      create_class_list_from(pals.healey_sarah_teacher, grade_level_next_year: '3')
      expect(authorized_class_list(pals.healey_sarah_teacher, 'foo-workspace-id')).to eq nil
    end
  end

  describe 'is_authorized_for_grade_level_now?' do
    def allowed?(educator, school, grade_level_now)
      ClassListQueries.new(educator).is_authorized_for_grade_level_now?(school.id, grade_level_now)
    end

    it 'does not let anyone outside expected grade levels' do
      expect(allowed?(pals.healey_vivian_teacher, pals.healey, 'PK')).to eq false
      expect(allowed?(pals.uri, pals.healey, '7')).to eq false
      expect(allowed?(pals.healey_laura_principal, pals.healey, '8')).to eq false
    end

    it 'does not let anyone outside expected schools' do
      expect(allowed?(pals.uri, pals.shs, '11')).to eq false
    end

    it 'works across roles in a school' do
      expect(allowed?(pals.uri, pals.healey, '3')).to eq true
      expect(allowed?(pals.uri, pals.healey, '5')).to eq true
      expect(allowed?(pals.healey_laura_principal, pals.healey, 'KF')).to eq true
      expect(allowed?(pals.healey_laura_principal, pals.healey, '3')).to eq true
      expect(allowed?(pals.healey_laura_principal, pals.healey, '5')).to eq true
      expect(allowed?(pals.healey_vivian_teacher, pals.healey, 'KF')).to eq true
      expect(allowed?(pals.healey_vivian_teacher, pals.healey, '1')).to eq false
      expect(allowed?(pals.healey_sarah_teacher, pals.healey, '5')).to eq true
      expect(allowed?(pals.healey_sarah_teacher, pals.healey, '6')).to eq false
    end

    it 'does not let reaching across grades' do
      expect(allowed?(pals.healey_sarah_teacher, pals.healey, '3')).to eq false
      expect(allowed?(pals.healey_sarah_teacher, pals.healey, '6')).to eq false
    end

    it 'does not let reaching across schools' do
      expect(allowed?(pals.west_marcus_teacher, pals.healey, '5')).to eq false
      expect(allowed?(pals.shs_jodi, pals.healey, '5')).to eq false
      expect(allowed?(pals.shs_bill_nye, pals.healey, '5')).to eq false
    end
  end

  describe 'is_authorized_for_school_id?' do
    def is_authorized_for_school_id?(educator, school)
      ClassListQueries.new(educator).is_authorized_for_school_id?(school.id)
    end

    it 'works across roles' do
      expect(is_authorized_for_school_id?(pals.uri, pals.healey)).to eq true
      expect(is_authorized_for_school_id?(pals.healey_laura_principal, pals.healey)).to eq true
      expect(is_authorized_for_school_id?(pals.healey_sarah_teacher, pals.healey)).to eq true
      expect(is_authorized_for_school_id?(pals.healey_vivian_teacher, pals.healey)).to eq true
      expect(is_authorized_for_school_id?(pals.shs_jodi, pals.healey)).to eq false
      expect(is_authorized_for_school_id?(pals.shs_bill_nye, pals.healey)).to eq false
      expect(is_authorized_for_school_id?(pals.west_marcus_teacher, pals.healey)).to eq false
      expect(is_authorized_for_school_id?(pals.uri, pals.west)).to eq true
      expect(is_authorized_for_school_id?(pals.west_marcus_teacher, pals.west)).to eq true
    end
  end
end
