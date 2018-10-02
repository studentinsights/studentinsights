require 'spec_helper'

# This is just sugar, mirroring how this is used in controller code
def authorized(educator, &block)
  Authorizer.new(educator).authorized(&block)
end

RSpec.describe Authorizer do
  let!(:pals) { TestPals.create! }

  it 'sets up test context correctly' do
    expect(School.all.size).to eq 13
    expect(Homeroom.all.size).to eq 6
    expect(Student.all.size).to eq 5
    expect(Educator.all.size).to eq 15
    expect(Course.all.size).to eq 3
    expect(Section.all.size).to eq 6
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
      expect(authorized(pals.uri) { students }).to contain_exactly(*[
        pals.healey_kindergarten_student,
        pals.west_eighth_ryan,
        pals.shs_freshman_mari,
        pals.shs_freshman_amir,
        pals.shs_senior_kylo
      ])
      expect(authorized(pals.healey_vivian_teacher) { students }).to eq [pals.healey_kindergarten_student]
      expect(authorized(pals.shs_bill_nye) { students }).to eq [pals.shs_freshman_mari]
    end

    it 'does not work when fields are missing on concrete models' do
      test_fields = Authorizer.student_fields_for_authorization - [:id]

      # Test each of the required fields individually
      test_fields.each do |missing_field|
        some_fields = test_fields - [missing_field]
        students = Student.select(*some_fields).all.to_a

        # Different educator permissions check different fields.
        # When this particular required field is missing, the check for
        # one of these educators should raise an error about a missing
        # attribute.
        expect do
          Educator.all.each do |educator|
            authorized(educator) { students }
          end
        end.to raise_error(ActiveModel::MissingAttributeError)
      end
    end
  end

  describe '.educator_field_for_authorization' do
    it 'does not work when fields are missing' do
      test_fields = Authorizer.educator_fields_for_authorization - [:id]

      # Test each of the required fields individually
      test_fields.each do |missing_field|
        students = Student.all
        some_fields = test_fields - [missing_field]

        # Different educator permissions check different field.
        # When this particular required field is missing, the check for
        # one of these educators should raise an error about a missing
        # attribute.
        expect do
          authorized(Educator.select(*some_fields).find(pals.uri.id)) { students }
          authorized(Educator.select(*some_fields).find(pals.healey_vivian_teacher.id)) { students }
          authorized(Educator.select(*some_fields).find(pals.healey_ell_teacher.id)) { students }
          authorized(Educator.select(*some_fields).find(pals.healey_sped_teacher.id)) { students }
          authorized(Educator.select(*some_fields).find(pals.shs_bill_nye.id)) { students }
          authorized(Educator.select(*some_fields).find(pals.shs_sofia_counselor.id)) { students }
        end.to raise_error(ActiveModel::MissingAttributeError)
      end
    end
  end

  describe '#authorized' do
    describe 'Student' do
      it 'limits access with Student.all' do
        expect(authorized(pals.uri) { Student.all }).to match_array [
          pals.healey_kindergarten_student,
          pals.west_eighth_ryan,
          pals.shs_freshman_mari,
          pals.shs_freshman_amir,
          pals.shs_senior_kylo
        ]
        expect(authorized(pals.healey_vivian_teacher) { Student.all }).to match_array [
          pals.healey_kindergarten_student
        ]
        expect(authorized(pals.shs_jodi) { Student.all }).to match_array [
          pals.shs_freshman_mari,
          pals.shs_freshman_amir
        ]
        expect(authorized(pals.shs_bill_nye) { Student.all }).to match_array [
          pals.shs_freshman_mari
        ]
      end

      it 'limits access for Student.find' do
        expect(authorized(pals.healey_vivian_teacher) { Student.find(pals.shs_freshman_mari.id) }).to eq nil
      end

      it 'limits access for arrays' do
        expect(authorized(pals.healey_vivian_teacher) { [pals.shs_freshman_mari, pals.healey_kindergarten_student] }).to eq [pals.healey_kindergarten_student]
      end

      it 'raises if given a Student model with `#select` filtering out fields needed for authorization' do
        thin_student = Student.select(:id, :local_id).find(pals.shs_freshman_mari.id)
        expect(authorized(pals.uri) { thin_student }.attributes).to eq({
          'id' => pals.shs_freshman_mari.id,
          'local_id' => pals.shs_freshman_mari.local_id
        })
        expect { authorized(pals.healey_vivian_teacher) { thin_student } }.to raise_error(ActiveModel::MissingAttributeError)
        expect { authorized(pals.shs_bill_nye) { thin_student } }.to raise_error(ActiveModel::MissingAttributeError)
      end

      it 'if `select` was used on an ActiveRecord::Relation for students, fields needed for authorization are added in' do
        thin_relation = Student.select(:id, :local_id).all
        expect((authorized(pals.uri) { thin_relation }).map(&:id)).to match_array([
          pals.healey_kindergarten_student.id,
          pals.west_eighth_ryan.id,
          pals.shs_freshman_mari.id,
          pals.shs_freshman_amir.id,
          pals.shs_senior_kylo.id
        ])
        expect((authorized(pals.healey_vivian_teacher) { thin_relation }).map(&:id)).to eq([
          pals.healey_kindergarten_student.id
        ])
        expect((authorized(pals.shs_bill_nye) { thin_relation }).map(&:id)).to eq([
          pals.shs_freshman_mari.id
        ])
      end
    end

    describe 'EventNote' do
      let!(:healey_public_note) { FactoryBot.create(:event_note, student: pals.healey_kindergarten_student) }
      let!(:healey_restricted_note) { FactoryBot.create(:event_note, student: pals.healey_kindergarten_student, is_restricted: true) }
      let!(:shs_public_note) { FactoryBot.create(:event_note, student: pals.shs_freshman_mari) }
      let!(:shs_restricted_note) { FactoryBot.create(:event_note, student: pals.shs_freshman_mari, is_restricted: true) }

      it 'limits access for relation' do
        expect(authorized(pals.uri) { EventNote.all }).to eq [
          healey_public_note,
          healey_restricted_note,
          shs_public_note,
          shs_restricted_note
        ]
        expect(authorized(pals.healey_vivian_teacher) { EventNote.all }).to eq [
          healey_public_note
        ]
        expect(authorized(pals.shs_bill_nye) { EventNote.all }).to eq [
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
        expect(authorized(pals.healey_vivian_teacher) { all_notes }).to eq [
          healey_public_note
        ]
        expect(authorized(pals.shs_bill_nye) { all_notes }).to eq [
          shs_public_note
        ]
      end

      it 'limits access for model' do
        def is_authorized(educator, note)
          authorized(educator) { note } == note # check that they can access it
        end

        expect(is_authorized(pals.uri, healey_public_note)).to eq true
        expect(is_authorized(pals.uri, healey_restricted_note)).to eq true
        expect(is_authorized(pals.uri, shs_public_note)).to eq true
        expect(is_authorized(pals.uri, shs_restricted_note)).to eq true
        expect(is_authorized(pals.healey_vivian_teacher, healey_public_note)).to eq true
        expect(is_authorized(pals.healey_vivian_teacher, healey_restricted_note)).to eq false
        expect(is_authorized(pals.healey_vivian_teacher, shs_public_note)).to eq false
        expect(is_authorized(pals.healey_vivian_teacher, shs_restricted_note)).to eq false
        expect(is_authorized(pals.shs_bill_nye, healey_public_note)).to eq false
        expect(is_authorized(pals.shs_bill_nye, healey_restricted_note)).to eq false
        expect(is_authorized(pals.shs_bill_nye, shs_public_note)).to eq true
        expect(is_authorized(pals.shs_bill_nye, shs_restricted_note)).to eq false
      end
    end

    describe 'TransitionNote' do
      let!(:healey_public_note) { FactoryBot.create(:transition_note, student: pals.healey_kindergarten_student) }
      let!(:healey_restricted_note) { FactoryBot.create(:transition_note, student: pals.healey_kindergarten_student, is_restricted: true) }
      let!(:shs_public_note) { FactoryBot.create(:transition_note, student: pals.shs_freshman_mari) }
      let!(:shs_restricted_note) { FactoryBot.create(:transition_note, student: pals.shs_freshman_mari, is_restricted: true) }

      it 'limits access for relation' do
        expect(authorized(pals.uri) { TransitionNote.all }).to contain_exactly(*[
          healey_public_note,
          healey_restricted_note,
          shs_public_note,
          shs_restricted_note
        ])
        expect(authorized(pals.healey_vivian_teacher) { TransitionNote.all }).to contain_exactly(*[
          healey_public_note
        ])
        expect(authorized(pals.shs_bill_nye) { TransitionNote.all }).to contain_exactly(*[
          shs_public_note
        ])
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
        expect(authorized(pals.healey_vivian_teacher) { all_notes }).to eq [
          healey_public_note
        ]
        expect(authorized(pals.shs_bill_nye) { all_notes }).to eq [
          shs_public_note
        ]
      end

      it 'limits access for model' do
        def is_authorized(educator, note)
          authorized(educator) { note } == note # check that they can access it
        end

        expect(is_authorized(pals.uri, healey_public_note)).to eq true
        expect(is_authorized(pals.uri, healey_restricted_note)).to eq true
        expect(is_authorized(pals.uri, shs_public_note)).to eq true
        expect(is_authorized(pals.uri, shs_restricted_note)).to eq true
        expect(is_authorized(pals.healey_vivian_teacher, healey_public_note)).to eq true
        expect(is_authorized(pals.healey_vivian_teacher, healey_restricted_note)).to eq false
        expect(is_authorized(pals.healey_vivian_teacher, shs_public_note)).to eq false
        expect(is_authorized(pals.healey_vivian_teacher, shs_restricted_note)).to eq false
        expect(is_authorized(pals.shs_bill_nye, healey_public_note)).to eq false
        expect(is_authorized(pals.shs_bill_nye, healey_restricted_note)).to eq false
        expect(is_authorized(pals.shs_bill_nye, shs_public_note)).to eq true
        expect(is_authorized(pals.shs_bill_nye, shs_restricted_note)).to eq false
      end
    end

    describe 'other models' do
      it 'raises on calls with unchecked models' do
        expect { authorized(pals.uri) { Educator.all } }.to raise_error(Exceptions::EducatorNotAuthorized)
      end
    end
  end

  describe '#is_authorized_for_student?' do
    context 'HS house master, 8th grade student, HOUSEMASTERS_AUTHORIZED_FOR_GRADE_8 on' do
      before do
        allow(ENV).to receive(:[]).with('HOUSEMASTERS_AUTHORIZED_FOR_GRADE_8').and_return('true')
      end

      it 'returns true' do
        expect(Authorizer.new(pals.shs_harry_housemaster).is_authorized_for_student?(pals.west_eighth_ryan)).to eq true
      end
    end

    context 'HS house master, 8th grade student, HOUSEMASTERS_AUTHORIZED_FOR_GRADE_8 off' do
      before do
        allow(ENV).to receive(:[]).with('HOUSEMASTERS_AUTHORIZED_FOR_GRADE_8').and_return(nil)
      end

      it 'returns true' do
        expect(Authorizer.new(pals.shs_harry_housemaster).is_authorized_for_student?(pals.west_eighth_ryan)).to eq false
      end
    end

    context 'HS house master, K student, HOUSEMASTERS_AUTHORIZED_FOR_GRADE_8 on' do
      before do
        allow(ENV).to receive(:[]).with('HOUSEMASTERS_AUTHORIZED_FOR_GRADE_8').and_return('true')
      end

      it 'returns false' do
        expect(Authorizer.new(pals.shs_harry_housemaster).is_authorized_for_student?(pals.healey_kindergarten_student)).to eq false
      end
    end

    it 'raises if `#select` was used on the `student` argument, and fields needed for authorization are missing' do
      thin_student = Student.select(:id, :local_id).find(pals.shs_freshman_mari.id)
      expect(Authorizer.new(pals.uri).is_authorized_for_student?(thin_student)).to eq true
      expect { Authorizer.new(pals.healey_vivian_teacher).is_authorized_for_student?(thin_student) }.to raise_error(ActiveModel::MissingAttributeError)
      expect { Authorizer.new(pals.shs_bill_nye).is_authorized_for_student?(thin_student) }.to raise_error(ActiveModel::MissingAttributeError)
    end
  end

  describe '#authorized_when_viewing_as' do
    def authorized_students_when_viewing_as(educator, view_as_educator)
      authorizer = Authorizer.new(educator)
      authorizer.authorized_when_viewing_as(view_as_educator) { Student.all }
    end

    context 'using Student as a test case' do
      it 'allows privileged user access to view as another educator' do
        expect(authorized_students_when_viewing_as(pals.uri, pals.healey_laura_principal)).to match_array [
          pals.healey_kindergarten_student
        ]
        expect(authorized_students_when_viewing_as(pals.uri, pals.healey_vivian_teacher)).to match_array [
          pals.healey_kindergarten_student
        ]
        expect(authorized_students_when_viewing_as(pals.uri, pals.shs_jodi)).to match_array [
          pals.shs_freshman_mari,
          pals.shs_freshman_amir
        ]
        expect(authorized_students_when_viewing_as(pals.uri, pals.shs_bill_nye)).to match_array [
          pals.shs_freshman_mari
        ]
      end

      it 'does not allow typical users elevated access when called incorrectly' do
        expect(authorized_students_when_viewing_as(pals.healey_laura_principal, pals.uri)).to match_array [
          pals.healey_kindergarten_student
        ]
        expect(authorized_students_when_viewing_as(pals.healey_vivian_teacher, pals.uri)).to match_array [
          pals.healey_kindergarten_student
        ]
        expect(authorized_students_when_viewing_as(pals.shs_jodi, pals.uri)).to match_array [
          pals.shs_freshman_mari,
          pals.shs_freshman_amir
        ]
        expect(authorized_students_when_viewing_as(pals.shs_bill_nye, pals.uri)).to match_array [
          pals.shs_freshman_mari
        ]
      end
    end
  end

  describe '#is_authorized_to_write_transition_notes?' do
    it 'only allows K8 counselor with label and access to restricted notes' do
      expect(Authorizer.new(pals.west_counselor).is_authorized_to_write_transition_notes?).to eq true
      (Educator.all - [pals.west_counselor]).each do |educator|
        expect(Authorizer.new(educator).is_authorized_to_write_transition_notes?).to eq false
      end
    end
  end

  describe '#is_authorized_for_deprecated_transition_note_ui??' do
    it 'only allows K8 counselor with label and access to deprecated restricted notes UI' do
      authorized_educators = [pals.west_counselor, pals.shs_harry_housemaster]
      authorized_educators.each do |educator|
        expect(Authorizer.new(educator).is_authorized_for_deprecated_transition_note_ui?).to eq true
      end
      (Educator.all - authorized_educators).each do |educator|
        expect(Authorizer.new(educator).is_authorized_to_write_transition_notes?).to eq false
      end
    end
  end
end
