require 'spec_helper'

# This is just sugar
def authorized(educator, &block)
  Authorizer.new(educator).authorized(&block)
end

# Take `as` and `bs`, and cross them all through the given block.
# Return a list of results, with triples `[a, b, value]`
# Useful for testing combinations of educators with different permissions,
# and models with different properties.
def test_grid(as, bs, &block)
  triples = []
  as.each do |a|
    bs.each do |b|
      value = block.call(a, b)
      triples << [a, b, value]
    end
  end
  triples
end

# Test that each line in a grid matches.
# Do this individually for each line to get better
# failure messages.
def expect_grid_equals(actual, expected)
  actual.each_with_index do |triple, index|
    expect(actual[index]).to eq expected[index]
  end
end


RSpec.describe Authorizer do
  let!(:pals) { TestPals.create! }

  it 'sets up test context correctly' do
    expect(School.all.size).to eq 11
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
      expect(authorized(pals.uri) { students }).to eq [
        pals.healey_kindergarten_student,
        pals.shs_student
      ]
      expect(authorized(pals.healey_teacher) { students }).to eq [pals.healey_kindergarten_student]
      expect(authorized(pals.shs_teacher) { students }).to eq [pals.shs_student]
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
          authorized(pals.uri) { students }
          authorized(pals.healey_teacher) { students }
          authorized(pals.healey_ell_teacher) { students }
          authorized(pals.healey_sped_teacher) { students }
          authorized(pals.shs_teacher) { students }
          authorized(pals.shs_ninth_grade_counselor) { students }
        end.to raise_error(ActiveModel::MissingAttributeError)
      end
    end
  end

  describe '#authorized' do
    describe 'Student' do
      it 'limits access with Student.all' do
        expect(authorized(pals.uri) { Student.all }).to eq [
          pals.healey_kindergarten_student,
          pals.shs_student
        ]
        expect(authorized(pals.healey_teacher) { Student.all }).to eq [
          pals.healey_kindergarten_student
        ]
        expect(authorized(pals.shs_teacher) { Student.all }).to eq [
          pals.shs_student
        ]
      end

      it 'limits access for Student.find' do
        expect(authorized(pals.healey_teacher) { Student.find(pals.shs_student.id) }).to eq nil
      end

      it 'limits access for arrays' do
        expect(authorized(pals.healey_teacher) { [pals.shs_student, pals.healey_kindergarten_student] }).to eq [pals.healey_kindergarten_student]
      end

      it 'raises if given a Student model with `#select` filtering out fields needed for authorization' do
        thin_student = Student.select(:id, :local_id).find(pals.shs_student.id)
        expect(authorized(pals.uri) { thin_student }.attributes).to eq({
          'id' => pals.shs_student.id,
          'local_id' => pals.shs_student.local_id 
        })
        expect { authorized(pals.healey_teacher) { thin_student } }.to raise_error(ActiveModel::MissingAttributeError)
        expect { authorized(pals.shs_teacher) { thin_student } }.to raise_error(ActiveModel::MissingAttributeError)
      end

      it 'if `select` was used on an ActiveRecord::Relation for students, fields needed for authorization are added in' do
        thin_student = Student.select(:id, :local_id).find(pals.shs_student.id)
        expect(authorized(pals.uri) { thin_student }.attributes).to eq({
          'id' => pals.shs_student.id,
          'local_id' => pals.shs_student.local_id 
        })
        expect { authorized(pals.healey_teacher) { thin_student } }.to raise_error(ActiveModel::MissingAttributeError)
        expect { authorized(pals.shs_teacher) { thin_student } }.to raise_error(ActiveModel::MissingAttributeError)
      end
    end

    describe 'EventNote' do
      let!(:healey_public_note) { FactoryGirl.create(:event_note, student: pals.healey_kindergarten_student) }
      let!(:healey_restricted_note) { FactoryGirl.create(:event_note, student: pals.healey_kindergarten_student, is_restricted: true) }
      let!(:shs_public_note) { FactoryGirl.create(:event_note, student: pals.shs_student) }
      let!(:shs_restricted_note) { FactoryGirl.create(:event_note, student: pals.shs_student, is_restricted: true) }

      it 'limits access for relation' do
        expect(authorized(pals.uri) { EventNote.all }).to eq [
          healey_public_note,
          healey_restricted_note,
          shs_public_note,
          shs_restricted_note
        ]
        expect(authorized(pals.healey_teacher) { EventNote.all }).to eq [
          healey_public_note
        ]
        expect(authorized(pals.shs_teacher) { EventNote.all }).to eq [
          shs_public_note
        ]
      end

      it 'limits access for array' do
        all_notes = [
          healey_public_note,
          healey_restricted_note,
          shs_public_note,
          shs_restricted_note
        ]
        expect(authorized(pals.uri) { all_notes }).to eq [
          healey_public_note,
          healey_restricted_note,
          shs_public_note,
          shs_restricted_note
        ]
        expect(authorized(pals.healey_teacher) { all_notes }).to eq [
          healey_public_note
        ]
        expect(authorized(pals.shs_teacher) { all_notes }).to eq [
          shs_public_note
        ]
      end

      it 'limits access for model' do
        educators = [pals.uri, pals.healey_teacher, pals.shs_teacher]
        notes = [healey_public_note, healey_restricted_note, shs_public_note, shs_restricted_note]
        grid = test_grid(educators, notes) do |educator, note|
          authorized(educator) { note } == note # check that they can access it
        end
        expect_grid_equals grid, [
          [pals.uri, healey_public_note, true],
          [pals.uri, healey_restricted_note, true],
          [pals.uri, shs_public_note, true],
          [pals.uri, shs_restricted_note, true],
          [pals.healey_teacher, healey_public_note, true],
          [pals.healey_teacher, healey_restricted_note, false],
          [pals.healey_teacher, shs_public_note, false],
          [pals.healey_teacher, shs_restricted_note, false],
          [pals.shs_teacher, healey_public_note, false],
          [pals.shs_teacher, healey_restricted_note, false],
          [pals.shs_teacher, shs_public_note, true],
          [pals.shs_teacher, shs_restricted_note, false]
        ]
      end
    end

    describe 'other models' do
      it 'raises on calls with unchecked models' do
        expect { authorized(pals.uri) { Educator.all } }.to raise_error(Exceptions::EducatorNotAuthorized)
      end
    end
  end

  describe '#is_authorized_for_student?' do
    it 'raises if `#select` was used on the `student` argument, and fields needed for authorization are missing' do
      thin_student = Student.select(:id, :local_id).find(pals.shs_student.id)
      expect(Authorizer.new(pals.uri).is_authorized_for_student?(thin_student)).to eq true
      expect { Authorizer.new(pals.healey_teacher).is_authorized_for_student?(thin_student) }.to raise_error(ActiveModel::MissingAttributeError)
      expect { Authorizer.new(pals.shs_teacher).is_authorized_for_student?(thin_student) }.to raise_error(ActiveModel::MissingAttributeError)
    end
  end
end
