require 'spec_helper'

RSpec.describe ClassList do
  def create_transition_note(params = {})
    TransitionNote.create({
      educator_id: pals.west_counselor.id,
      student_id: pals.west_eighth_ryan.id,
      text: 'foo',
      is_restricted: false
    }.merge(params))
  end

  # def revise_class_list(class_list, educator, params = {})
  #   revised_class_list = clas_list.dup
  #   revised_class_list.update!({
  #     revised_by_principal_educator_id: educator.id,
  #   }.merge(params))
  #   revised_class_list
  # end

  let!(:pals) { TestPals.create! }

  describe 'validations' do
    it 'requires presence of educator, student' do
      expect(create_transition_note({
        educator_id: nil,
        student_id: nil
      }).errors.details).to eq({
        student: [{error: :blank}],
        educator: [{error: :blank}]
      })
    end

    it 'enforces only_one_restricted_note' do
      expect(create_transition_note({
        student_id: pals.west_eighth_ryan.id,
        is_restricted: false,
        text: 'foo'
      }).errors.details).to eq({})
      expect(create_transition_note({
        student_id: pals.west_eighth_ryan.id,
        is_restricted: false,
        text: 'foo'
      }).errors.details).to eq({foo: 'bar'})
    end

    it 'enforces only_one_regular_note' do
      expect(create_transition_note({
        student_id: pals.west_eighth_ryan.id,
        is_restricted: true,
        text: 'foo'
      }).errors.details).to eq({})
      expect(create_transition_note({
        student_id: pals.west_eighth_ryan.id,
        is_restricted: true,
        text: 'foo'
      }).errors.details).to eq({foo: 'bar'})
    end

    it 'allows only one of each' do
      expect(create_transition_note({
        student_id: pals.west_eighth_ryan.id,
        is_restricted: true,
        text: 'foo'
      }).errors.details).to eq({})
      expect(create_transition_note({
        student_id: pals.west_eighth_ryan.id,
        is_restricted: false,
        text: 'foo'
      }).errors.details).to eq({})
    end
  end

  # describe 'validate_single_writer_in_workspace' do
  #   it 'rejects new records in workspace with different writer' do
  #     expect(create_class_list_from(pals.healey_sarah_teacher).errors.details).to eq({})
  #     expect(create_class_list_from(pals.uri).errors.details).to eq({
  #       created_by_teacher_educator_id: [{error: 'cannot add different created_by_teacher_educator_id to existing workspace_id'}]
  #     })
  #   end
  # end

  # describe 'validate_consistent_workspace_grade_school' do
  #   it 'rejects new records in workspace with different school_id or grade_level_next_year' do
  #     expect(create_class_list_from(pals.uri).errors.details).to eq({})
  #     expect(create_class_list_from(pals.uri, grade_level_next_year: '3').errors.details).to eq({
  #       grade_level_next_year: [{:error=>"cannot add different grade_level_next_year to existing workspace_id"}]
  #     })
  #     expect(create_class_list_from(pals.uri, school_id: pals.west.id).errors.details).to eq({
  #       school_id: [{:error=>"cannot add different school_id to existing workspace_id"}]
  #     })
  #   end
  # end
end
