require 'spec_helper'

RSpec.describe ClassList do
  def create_class_list_from(educator, params = {})
    ClassList.create({
      workspace_id: 'foo-workspace-id',
      created_by_teacher_educator_id: educator.id,
      school_id: educator.school_id,
      grade_level_next_year: '6',
      json: { foo: 'bar' }
    }.merge(params))
  end

  def revise_class_list(class_list, educator, params = {})
    revised_class_list = clas_list.dup
    revised_class_list.update!({
      revised_by_principal_educator_id: educator.id,
    }.merge(params))
    revised_class_list
  end

  let!(:pals) { TestPals.create! }

  describe 'presence validations' do
    it 'requires school_id, grade_level_next_year, created_by_teacher_educator_id' do
      expect(create_class_list_from(pals.healey_sarah_teacher, {
        school_id: nil,
        grade_level_next_year: nil,
        created_by_teacher_educator_id: nil
      }).errors.details).to eq({
        school_id: [{error: :blank}],
        grade_level_next_year: [{error: :blank}],
        created_by_teacher_educator_id: [{error: :blank}]
      })
    end
  end

  describe 'validate_single_writer_in_workspace' do
    it 'rejects new records in workspace with different writer' do
      expect(create_class_list_from(pals.healey_sarah_teacher).errors.details).to eq({})
      expect(create_class_list_from(pals.uri).errors.details).to eq({
        created_by_teacher_educator_id: [{error: 'cannot add different created_by_teacher_educator_id to existing workspace_id'}]
      })
    end
  end

  describe 'validate_consistent_workspace_grade_school' do
    it 'rejects new records in workspace with different school_id or grade_level_next_year' do
      expect(create_class_list_from(pals.uri).errors.details).to eq({})
      expect(create_class_list_from(pals.uri, grade_level_next_year: '3').errors.details).to eq({
        grade_level_next_year: [{:error=>"cannot add different grade_level_next_year to existing workspace_id"}]
      })
      expect(create_class_list_from(pals.uri, school_id: pals.west.id).errors.details).to eq({
        school_id: [{:error=>"cannot add different school_id to existing workspace_id"}]
      })
    end
  end
end
