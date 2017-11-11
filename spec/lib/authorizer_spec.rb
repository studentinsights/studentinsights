require 'spec_helper'

# This is just sugar
def authorized(educator, &block)
  Authorizer.new(educator).authorized(&block)
end


RSpec.describe Authorizer do
  before { School.seed_somerville_schools }

  # districtwide
  let!(:districtwide_admin) do
    FactoryGirl.create(:educator, districtwide_access: true)
  end

  # healey
  let!(:healey) { School.find_by_local_id('HEA') }
  let!(:healey_kindergarten_homeroom) { FactoryGirl.create(:homeroom, school: healey) }
  let!(:healey_kindergarten_student) do
    FactoryGirl.create(:student, {
      school: healey,
      homeroom: healey_kindergarten_homeroom,
      grade: 'KF'
    })
  end
  let!(:healey_teacher) do
    FactoryGirl.create(:educator, {
      school: healey,
      homeroom: healey_kindergarten_homeroom
    })
  end
  let!(:healey_ell_teacher) do
    FactoryGirl.create(:educator, {
      restricted_to_english_language_learners: true,
      school: healey
    })
  end
  let!(:healey_sped_teacher) do
    FactoryGirl.create(:educator, {
      restricted_to_sped_students: true,
      school: healey
    })
  end

  # high school
  let!(:shs) { School.find_by_local_id('SHS') }
  let!(:shs_homeroom) { FactoryGirl.create(:homeroom, school: shs) }
  let!(:shs_student) do
    FactoryGirl.create(:student, {
      school: shs,
      homeroom: shs_homeroom,
      grade: '9'
    })
  end
  let!(:shs_teacher) do
    FactoryGirl.create(:educator, {
      school: shs,
      homeroom: shs_homeroom
    })
  end
  let!(:shs_ninth_grade_counselor) do
    FactoryGirl.create(:educator, {
      school: shs,
      grade_level_access: ['9']
    })
  end
  

  it 'sets up test context correctly' do
    expect(School.all.size).to eq 12
    expect(Homeroom.all.size).to eq 2
    expect(Student.all.size).to eq 2
    expect(Educator.all.size).to eq 6
  end

  describe '.student_fields_for_authorization' do
    it 'has the expected fields' do
      expect(Authorizer.student_fields_for_authorization).to eq [
        :id,
        :program_assigned,
        :limited_english_proficiency,
        :school_id,
        :grade
      ]
    end

    it 'works for authorization' do
      students = Student.select(*Authorizer.student_fields_for_authorization).all
      expect(authorized(districtwide_admin) { students }).to eq [
        healey_kindergarten_student,
        shs_student
      ]
      expect(authorized(healey_teacher) { students }).to eq [healey_kindergarten_student]
      expect(authorized(shs_teacher) { students }).to eq [shs_student]
    end

    it 'does not work when fields are missing' do
      test_fields = Authorizer.student_fields_for_authorization - [:id]

      # Test each of the required fields individually
      test_fields.each do |missing_field|
        some_fields = test_fields - [missing_field]
        students = Student.select(*some_fields).all

        # Different educator permissions check different field.
        # When this particular required field is missing, the check for
        # one of these educators should raise an error about a missing
        # attribute.
        expect do
          authorized(districtwide_admin) { students }
          authorized(healey_teacher) { students }
          authorized(healey_ell_teacher) { students }
          authorized(healey_sped_teacher) { students }
          authorized(shs_teacher) { students }
          authorized(shs_ninth_grade_counselor) { students }
        end.to raise_error(ActiveModel::MissingAttributeError)
      end
    end
  end

  describe '#authorized' do
    describe 'Student' do
      it 'limits access with Student.all' do
        expect(authorized(districtwide_admin) { Student.all }).to eq [
          healey_kindergarten_student,
          shs_student
        ]
        expect(authorized(healey_teacher) { Student.all }).to eq [
          healey_kindergarten_student
        ]
        expect(authorized(shs_teacher) { Student.all }).to eq [
          shs_student
        ]
      end

      it 'limits access for Student.find' do
        expect(authorized(healey_teacher) { Student.find(shs_student.id) }).to eq nil
      end

      it 'limits access for arrays' do
        expect(authorized(healey_teacher) { [shs_student, healey_kindergarten_student] }).to eq [healey_kindergarten_student]
      end

      it 'raises if given a Student model with `#select` filtering out fields needed for authorization' do
        thin_student = Student.select(:id, :local_id).find(shs_student.id)
        expect(authorized(districtwide_admin) { thin_student }.attributes).to eq({
          'id' => shs_student.id,
          'local_id' => shs_student.local_id 
        })
        expect { authorized(healey_teacher) { thin_student } }.to raise_error(ActiveModel::MissingAttributeError)
        expect { authorized(shs_teacher) { thin_student } }.to raise_error(ActiveModel::MissingAttributeError)
      end

      # Here the developer was probably trying to optimize the query, and we can adjust it
      # a bit to get what we need for authorization.  So we do that and continue.
      it 'if `select` was used on an ActiveRecord::Relation for students, fields needed for authorization are added in' do
        thin_student = Student.select(:id, :local_id).find(shs_student.id)
        expect(authorized(districtwide_admin) { thin_student }.attributes).to eq({
          'id' => shs_student.id,
          'local_id' => shs_student.local_id 
        })
        expect { authorized(healey_teacher) { thin_student } }.to raise_error(ActiveModel::MissingAttributeError)
        expect { authorized(shs_teacher) { thin_student } }.to raise_error(ActiveModel::MissingAttributeError)
      end
    end

    describe 'EventNote' do
      it 'works for EventNote.all' do
        healey_public_note = FactoryGirl.create(:event_note, student: healey_kindergarten_student)
        healey_restricted_note = FactoryGirl.create(:event_note, student: healey_kindergarten_student, is_restricted: true)
        shs_public_note = FactoryGirl.create(:event_note, student: shs_student)
        shs_restricted_note = FactoryGirl.create(:event_note, student: shs_student, is_restricted: true)

        expect(authorized(districtwide_admin) { EventNote.all }).to eq [
          healey_public_note,
          healey_restricted_note,
          shs_public_note,
          shs_restricted_note
        ]
        expect(authorized(healey_teacher) { EventNote.all }).to eq [
          healey_public_note
        ]
        expect(authorized(shs_teacher) { EventNote.all }).to eq [
          shs_public_note
        ]
      end
    end

    describe 'other models' do
      it 'raises on calls with unchecked models' do
        expect { authorized(districtwide_admin) { Educator.all } }.to raise_error(Exceptions::EducatorNotAuthorized)
      end
    end
  end

  describe '#is_authorized_for_student?' do
    # This is built-in Rails behavior; we wait to raise if this happens, since developers are likely
    # trying to write an optimization that the authorization layer will have to undo.
    it 'raises if `#select` was used on the `student` argument, and fields needed for authorization are missing' do
      thin_student = Student.select(:id, :local_id).find(shs_student.id)
      expect(Authorizer.new(districtwide_admin).is_authorized_for_student?(thin_student)).to eq true
      expect { Authorizer.new(healey_teacher).is_authorized_for_student?(thin_student) }.to raise_error(ActiveModel::MissingAttributeError)
      expect { Authorizer.new(shs_teacher).is_authorized_for_student?(thin_student) }.to raise_error(ActiveModel::MissingAttributeError)
    end
  end
end
