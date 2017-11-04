require 'rails_helper'

RSpec.describe Educator do

  describe '#as_json' do
    it 'does not include student_searchbar_json' do
      educator = FactoryGirl.build(:educator)
      expect(educator.as_json.has_key?('student_searchbar_json')).to be false
    end
  end
  describe '#has_school_unless_districtwide' do
    context 'no school assigned' do
      context 'has districtwide_access' do
        let(:educator) {
          FactoryGirl.build(:educator, school: nil, districtwide_access: true)
        }
        it 'is valid' do
          expect(educator).to be_valid
        end
      end

      context 'does not have districtwide_access' do
        let(:educator) {
          FactoryGirl.build(:educator, school: nil, districtwide_access: false)
        }
        it 'is not valid' do
          expect(educator).to be_invalid
        end
      end
    end
  end

  describe '#admin_gets_access_to_all_students' do
    context 'admin with access to all students' do
      let(:admin) { FactoryGirl.build(:educator, :admin) }
      it 'is valid' do
        expect(admin).to be_valid
      end
    end
    context 'admin without access to all students' do
      let(:admin) { FactoryGirl.build(:educator, :admin, restricted_to_sped_students: true) }
      it 'is invalid' do
        expect(admin).to be_invalid
      end
    end
  end

  describe 'grade level access' do
    context 'mix of strings and not strings' do
      let(:educator) { FactoryGirl.create(:educator, grade_level_access: ['3', 4]) }
      it 'is coerced into an array of strings' do
        expect(educator.grade_level_access).to eq ["3", "4"]
      end
    end
    context 'only integers' do
      let(:educator) { FactoryGirl.create(:educator, grade_level_access: [3, 4]) }
      it 'is coerced into an array of strings' do
        expect(educator.grade_level_access).to eq ["3", "4"]
      end
    end
  end

  describe '#is_authorized_for_student' do
    let(:authorized?) { educator.is_authorized_for_student(student) }
    let(:healey) { FactoryGirl.create(:healey) }
    let(:brown) { FactoryGirl.create(:brown) }

    context 'educator has districtwide access' do
      let(:student) { FactoryGirl.create(:student, school: healey) }
      let(:educator) {
        FactoryGirl.create(:educator, school: brown, districtwide_access: true)
      }

      it 'grants access despite student being from different school' do
        expect(authorized?).to be true
      end
    end

    context 'student belongs to same school' do
      let(:student) { FactoryGirl.create(:student, school: healey) }

      context 'educator does not have schoolwide access' do
        let(:educator) { FactoryGirl.create(:educator, school: healey) }
        it 'is not authorized' do
          expect(authorized?).to be false
        end
      end

      context 'educator has schoolwide access' do
        let(:educator) { FactoryGirl.create(:educator, school: healey, schoolwide_access: true) }
        it 'is authorized' do
          expect(authorized?).to be true
        end
      end

      context 'educator has student in a section' do
        let!(:educator) { FactoryGirl.create(:educator, school: healey) }
        let!(:course) { FactoryGirl.create(:course) }
        let!(:section) { FactoryGirl.create(:section, course: course) }
        let!(:esa) { FactoryGirl.create(:educator_section_assignment, educator: educator, section: section) }
        let!(:ssa) { FactoryGirl.create(:student_section_assignment, student: student, section: section) }

        it 'is authorized' do
          expect(authorized?).to be true
        end
      end

    end

    context 'student belongs to different school' do
      let(:educator) { FactoryGirl.create(:educator, school: healey, schoolwide_access: true) }
      let(:student) { FactoryGirl.create(:student, school: brown) }

      it 'is not authorized' do
        expect(authorized?).to be false
      end
    end

  end

  describe '#local_email' do
    context 'no email' do
      it 'is invalid' do
        expect(FactoryGirl.build(:educator, :without_email)).to be_invalid
      end
    end
  end

  describe '#students_for_school_overview' do
    let!(:school) { FactoryGirl.create(:school) }

    context 'schoolwide_access' do
      let(:educator) { FactoryGirl.create(:educator, schoolwide_access: true, school: school) }
      let!(:include_me) { FactoryGirl.create(:student, school: school) }
      let!(:include_me_too) { FactoryGirl.create(:student, school: school) }
      let!(:include_me_not) { FactoryGirl.create(:student) }

      let(:students_for_school_overview) { educator.students_for_school_overview }

      it 'returns all students in the school' do
        expect(students_for_school_overview).to include include_me
        expect(students_for_school_overview).to include include_me_too
      end
    end

    context 'has_access_to_grade_levels' do
      let(:educator) { FactoryGirl.create(:educator, grade_level_access: ['2'], school: school) }
      let!(:include_me) { FactoryGirl.create(:student, school: school, grade: '2') }
      let!(:include_me_not) { FactoryGirl.create(:student, school: school, grade: '1') }
      let!(:include_me_not) { FactoryGirl.create(:student, grade: '2') }

      it 'returns students at the appropriate grade levels' do
        expect(educator.students_for_school_overview).to include include_me
      end
    end

  end

  describe '#default_homeroom' do

    context 'no homerooms' do
      let(:educator) { FactoryGirl.create(:educator) }

      it 'raises an error' do
        expect { educator.default_homeroom }.to raise_error Exceptions::NoHomerooms
      end
    end

    context 'educator assigned a homeroom' do
      let(:educator) { FactoryGirl.create(:educator) }
      let!(:homeroom) { FactoryGirl.create(:homeroom, educator: educator) }

      it 'raises an error' do
        expect(educator.default_homeroom).to eq homeroom
      end
    end

    context 'educator not assigned a homeroom' do
      let!(:homeroom) { FactoryGirl.create(:homeroom) }
      let(:educator) { FactoryGirl.create(:educator) }

      it 'raises an error' do
        expect { educator.default_homeroom }.to raise_error Exceptions::NoAssignedHomeroom
      end
    end

  end

  describe '#allowed_homerooms' do
    let!(:school) { FactoryGirl.create(:healey) }
    let!(:other_school) { FactoryGirl.create(:brown) }

    context 'schoolwide_access' do
      let(:educator) { FactoryGirl.create(:educator, schoolwide_access: true, school: school) }
      let!(:homeroom_101) { FactoryGirl.create(:homeroom, school: school) }
      let!(:homeroom_102) { FactoryGirl.create(:homeroom, school: school) }
      let!(:homeroom_103) { FactoryGirl.create(:homeroom, grade: '2', school: school) }

      it 'returns all homerooms in the school' do
        expect(educator.allowed_homerooms.sort).to eq [
          homeroom_101, homeroom_102, homeroom_103
        ].sort
      end
    end

    context 'districtwide_access' do
      let(:educator) { FactoryGirl.create(:educator, districtwide_access: true, school: school) }
      let!(:homeroom_101) { FactoryGirl.create(:homeroom, school: school) }
      let!(:homeroom_102) { FactoryGirl.create(:homeroom, school: other_school) }
      let!(:homeroom_103) { FactoryGirl.create(:homeroom, grade: '2', school: other_school) }

      it 'returns all homerooms in the school' do
        expect(educator.allowed_homerooms.sort).to eq [
          homeroom_101, homeroom_102, homeroom_103
        ].sort
      end
    end

    context 'homeroom teacher' do
      let(:educator) { FactoryGirl.create(:educator, school: school) }
      let!(:homeroom_101) { FactoryGirl.create(:homeroom, grade: 'K', educator: educator, school: school) }
      let!(:homeroom_102) { FactoryGirl.create(:homeroom, grade: 'K', school: school) }
      let!(:homeroom_103) { FactoryGirl.create(:homeroom, grade: '2', school: school) }
      let!(:homeroom_brn) { FactoryGirl.create(:homeroom, grade: '2', school: other_school) }

      it 'returns educator\'s homeroom plus other homerooms at same grade level in same school' do
        expect(educator.allowed_homerooms.sort).to eq [homeroom_101, homeroom_102].sort
      end
    end

    context 'teacher with grade level access' do
      let(:educator) { FactoryGirl.create(:educator, grade_level_access: ['2'], school: school) }
      let!(:homeroom_101) { FactoryGirl.create(:homeroom, grade: 'K', school: school) }
      let!(:homeroom_102) { FactoryGirl.create(:homeroom, grade: 'K', school: school) }
      let!(:homeroom_103) { FactoryGirl.create(:homeroom, grade: '2', school: school) }

      it 'returns all homerooms that match the grade level access' do
        expect(educator.allowed_homerooms).to eq [homeroom_103]
      end
    end

  end

  describe '#save_student_searchbar_json' do
    context 'educator has permissions for a few students' do
      let(:school) { FactoryGirl.create(:school, local_id: 'Big River High') }
      let!(:betsy) { FactoryGirl.create(:student, first_name: 'Betsy', last_name: 'Ramirez', school: school, grade: '3') }
      let!(:bettina) { FactoryGirl.create(:student, first_name: 'Bettina', last_name: 'Abbas', school: school, grade: '3') }
      let(:educator) { FactoryGirl.create(:educator, districtwide_access: true) }

      it 'saves the correct JSON' do
        educator.save_student_searchbar_json
        expect(educator.student_searchbar_json).to eq(
          "[{\"label\":\"Betsy Ramirez - Big River High - 3\",\"id\":#{betsy.id}},{\"label\":\"Bettina Abbas - Big River High - 3\",\"id\":#{bettina.id}}]"
        )
      end
    end
    context 'educator has permissions for no students' do
      let(:educator) { FactoryGirl.create(:educator) }

      it 'saves the correct JSON' do
        educator.save_student_searchbar_json
        expect(educator.student_searchbar_json).to eq("[]")
      end
    end
  end
  describe '#allowed_sections' do
    let!(:school) { FactoryGirl.create(:healey) }
    let!(:other_school) { FactoryGirl.create(:brown) }
    let!(:in_school_course) { FactoryGirl.create(:course, school: school) }
    let!(:in_school_section) { FactoryGirl.create(:section, course: in_school_course) }
    let!(:out_of_school_course) { FactoryGirl.create(:course, school: other_school)}
    let!(:out_of_school_section) { FactoryGirl.create(:section, course: out_of_school_course) }

    context 'schoolwide_access' do
      let(:schoolwide_educator) { FactoryGirl.create(:educator, school: school, schoolwide_access: true)}
      it 'returns all sections in the school' do
        expect(schoolwide_educator.allowed_sections.sort).to eq [
          in_school_section
        ].sort
      end
    end

    context 'districtwide_access' do
      let(:districtwide_educator) { FactoryGirl.create(:educator, school: school, districtwide_access: true)}
      it 'returns all sections in the district' do
        expect(districtwide_educator.allowed_sections.sort).to eq [
          in_school_section, out_of_school_section
        ].sort
      end
    end

    context 'regular teacher' do
      let(:educator) { FactoryGirl.create(:educator, school: school) }
      let!(:other_in_school_section) { FactoryGirl.create(:section, course: in_school_course) }
      let!(:esa) { FactoryGirl.create(:educator_section_assignment, educator: educator, section: in_school_section) }
      let!(:other_esa) { FactoryGirl.create(:educator_section_assignment, educator: educator, section: other_in_school_section) }
      it 'returns all sections assigned to the educator' do
        expect(educator.allowed_sections.sort).to eq [
          in_school_section, other_in_school_section
        ].sort
      end
    end
  end

  describe '#is_authorized_for_section' do
    let!(:school) { FactoryGirl.create(:healey) }
    let!(:other_school) { FactoryGirl.create(:brown) }
    let!(:in_school_course) { FactoryGirl.create(:course, school: school) }
    let!(:in_school_section) { FactoryGirl.create(:section, course: in_school_course) }
    let!(:out_of_school_course) { FactoryGirl.create(:course, school: other_school)}
    let!(:out_of_school_section) { FactoryGirl.create(:section, course: out_of_school_course) }

    context 'schoolwide_access' do
      let(:schoolwide_educator) { FactoryGirl.create(:educator, school: school, schoolwide_access: true)}

      it 'has access to a section in their school' do
        expect(schoolwide_educator.is_authorized_for_section(in_school_section)).to be true
      end

      it 'does not have access to a section outside their school' do
        expect(schoolwide_educator.is_authorized_for_section(out_of_school_section)).to be false
      end
    end

    context 'districtwide_access' do
      let(:districtwide_educator) { FactoryGirl.create(:educator, school: school, districtwide_access: true)}

      it 'has access to a section outside their school' do
        expect(districtwide_educator.is_authorized_for_section(out_of_school_section)).to be true
      end
    end

    context 'regular teacher' do
      let(:educator) { FactoryGirl.create(:educator, school: school) }
      let!(:other_in_school_section) { FactoryGirl.create(:section, course: in_school_course) }
      let!(:esa) { FactoryGirl.create(:educator_section_assignment, educator: educator, section: in_school_section) }

      it 'has access to a section assigned to that educator' do
        expect(educator.is_authorized_for_section(in_school_section)).to be true
      end

      it 'does not have access to a section not assigned to that educator' do
        expect(educator.is_authorized_for_section(other_in_school_section)).to be false
      end

    end
  end

end
