require 'rails_helper'

RSpec.describe Educator do

  describe '#admin_gets_access_to_all_students' do
    context 'admin with access to all students' do
      let(:admin) { FactoryGirl.build(:educator, :admin) }
      it 'is valid' do
        expect(admin).to be_valid
      end
    end
    context 'admin without access to all students' do
      let(:admin) { FactoryGirl.build(:educator, :admin, schoolwide_access: false) }
      it 'is invalid' do
        expect(admin).to be_invalid
      end
    end
    context 'non-admin, no specific permissions set' do
      let(:educator) { FactoryGirl.build(:educator) }
      it 'is valid' do
        expect(educator).to be_valid
      end
    end
  end

  describe '#is_authorized_for_student' do
    let(:authorized?) { educator.is_authorized_for_student(student) }

    context 'educator belongs to school' do
      let(:healey) { FactoryGirl.create(:healey) }

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
      end

      context 'student belongs to different school' do
        let(:brown) { FactoryGirl.create(:brown) }
        let(:educator) { FactoryGirl.create(:educator, school: healey, schoolwide_access: true) }
        let(:student) { FactoryGirl.create(:student, school: brown) }
        it 'is not authorized' do
          expect(authorized?).to be false
        end
      end

    end

    context 'educator does not belong to school' do
      let(:student) { FactoryGirl.create(:student) }
      context 'educator is admin' do
        let(:educator) { FactoryGirl.create(:educator, :admin) }
        it 'is authorized' do
          expect(authorized?).to be true
        end
      end
      context 'educator is not admin' do
        let(:educator) { FactoryGirl.create(:educator) }
        it 'is not authorized' do
          expect(authorized?).to be false
        end
      end
    end
  end

  describe '#local_id' do
    context 'no local id' do
      it 'is invalid' do
        expect(FactoryGirl.build(:educator, :without_local_id)).to be_invalid
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

    context 'admin' do
      let(:educator) { FactoryGirl.create(:educator, schoolwide_access: true) }
      let!(:homeroom_101) { FactoryGirl.create(:homeroom) }
      let!(:homeroom_102) { FactoryGirl.create(:homeroom) }
      let!(:homeroom_103) { FactoryGirl.create(:homeroom, grade: '2') }

      it 'returns all homerooms' do
        expect(educator.allowed_homerooms.sort).to eq [homeroom_101, homeroom_102, homeroom_103].sort
      end
    end

    context 'homeroom teacher' do
      let(:educator) { FactoryGirl.create(:educator) }
      let!(:homeroom_101) { FactoryGirl.create(:homeroom, grade: 'K', educator: educator) }
      let!(:homeroom_102) { FactoryGirl.create(:homeroom, grade: 'K') }
      let!(:homeroom_103) { FactoryGirl.create(:homeroom, grade: '2') }

      it 'returns the teacher\'s homeroom and other homerooms with the same grade level' do
        expect(educator.allowed_homerooms).to eq [homeroom_101, homeroom_102]
      end
    end

    context 'teacher with grade level access' do
      let(:educator) { FactoryGirl.create(:educator, grade_level_access: ['2']) }
      let!(:homeroom_101) { FactoryGirl.create(:homeroom, grade: 'K') }
      let!(:homeroom_102) { FactoryGirl.create(:homeroom, grade: 'K') }
      let!(:homeroom_103) { FactoryGirl.create(:homeroom, grade: '2') }

      it 'returns all homerooms that match the grade level access' do
        expect(educator.allowed_homerooms).to eq [homeroom_103]
      end
    end

  end

  describe '#allowed_homerooms_by_name' do
    context 'admin' do
      let(:educator) { FactoryGirl.create(:educator, schoolwide_access: true) }
      let!(:homeroom_101) { FactoryGirl.create(:homeroom, name: 'Muskrats') }
      let!(:homeroom_102) { FactoryGirl.create(:homeroom, name: 'Hawks') }
      let!(:homeroom_103) { FactoryGirl.create(:homeroom, name: 'Badgers') }

      it 'returns all homerooms\', ordered alphabetically by name' do
        expect(educator.allowed_homerooms_by_name).to eq [homeroom_103, homeroom_102, homeroom_101]
      end
    end
  end

end
