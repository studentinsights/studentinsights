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

  describe 'validate_submitted_not_undone' do
    it 'does not allow changing workspace back to submitted: false' do
      expect(create_class_list_from(pals.uri, submitted: true).errors.details).to eq({})
      expect(create_class_list_from(pals.uri, submitted: false).errors.details).to eq({
        submitted: [{:error=>"cannot change submitted: true workspace foo-workspace-id to submitted: false"}]
      })
    end
  end

  describe '#snapshot_if_changed' do
    it 'creates a snapshot on first run' do
      class_list = create_class_list_from(pals.healey_vivian_teacher, json: {
        studentIdsByRoom: {
          'room:0': [pals.healey_kindergarten_student.id]
        }
      })
      snapshot = class_list.snapshot_if_changed
      expect(snapshot.students_json.size).to eq 1
      expect(snapshot.students_json.first['id']).to eq pals.healey_kindergarten_student.id
      expect(ClassListSnapshot.all.size).to eq 1
    end

    it 'does nothing and returns nil when nothing has changed' do
      class_list = create_class_list_from(pals.healey_vivian_teacher, json: {
        studentIdsByRoom: {
          'room:0': [pals.healey_kindergarten_student.id]
        }
      })
      expect(class_list.snapshot_if_changed.class_list_id).to eq(class_list.id)
      expect(class_list.snapshot_if_changed).to eq(nil)
      expect(class_list.snapshot_if_changed).to eq(nil)
    end

    it 'creates a new snapshot when student data has changed' do
      class_list = create_class_list_from(pals.healey_vivian_teacher, json: {
        studentIdsByRoom: {
          'room:0': [pals.healey_kindergarten_student.id]
        }
      })
      first_snapshot = class_list.snapshot_if_changed
      expect(first_snapshot).not_to eq(nil)

      pals.healey_kindergarten_student.update!(program_assigned: 'SEIP')
      second_snapshot = class_list.snapshot_if_changed
      expect(second_snapshot).not_to eq(nil)
      expect(first_snapshot.students_json.first['program_assigned']).to eq(nil)
      expect(second_snapshot.students_json.first['program_assigned']).to eq('SEIP')
      expect(ClassListSnapshot.all.size).to eq 2
    end

  end
end
