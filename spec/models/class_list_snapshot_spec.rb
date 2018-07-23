require 'spec_helper'

RSpec.describe ClassListSnapshot do
  let!(:pals) { TestPals.create! }

  describe '.snapshot_all_workspaces' do
    it 'calls snapshot_if_changed on all workspaces' do
      class_list = ClassList.create!({
        workspace_id: 'foo-workspace-id',
        created_by_teacher_educator_id: pals.healey_vivian_teacher.id,
        school_id: pals.healey_vivian_teacher.school_id,
        grade_level_next_year: '1',
        json: {
          studentIdsByRoom: {
            'room:0': [pals.healey_kindergarten_student.id]
          }
        }
      })
      log = LogHelper::FakeLog.new
      snapshots_taken = ClassListSnapshot.snapshot_all_workspaces(log: log)

      expect(snapshots_taken.size).to eq 1
      expect(snapshots_taken.first[:workspace_id]).to eq 'foo-workspace-id'
      expect(snapshots_taken.first[:class_list_id]).to eq class_list.id
      expect(snapshots_taken.first[:snapshot].students_json.first['id']).to eq pals.healey_kindergarten_student.id
      expect(ClassListSnapshot.all.size).to eq 1

      expect(log.output).to include('ClassListSnapshot.snapshot_all_workspaces: starting...')
      expect(log.output).to include('snapshot_all_workspaces: Found 1 workspaces.')
      expect(log.output).to include('snapshot_all_workspaces: created snapshot.')
      expect(log.output).to include('ClassListSnapshot.snapshot_all_workspaces: done.')
    end
  end

  describe '.diffs_across_workspaces' do
    def create_class_list_with(student_ids_by_room)
      ClassList.create!({
        workspace_id: 'foo-workspace-id',
        created_by_teacher_educator_id: pals.healey_vivian_teacher.id,
        school_id: pals.healey_vivian_teacher.school_id,
        grade_level_next_year: '1',
        json: {
          studentIdsByRoom: student_ids_by_room
        }
      })
    end

    it 'works on happy path' do
      # initial class list
      first_class_list = create_class_list_with({
        'room:unplaced': [pals.healey_kindergarten_student.id],
        'room:0': []
      })
      first_snapshot = first_class_list.snapshot_if_changed
      first_snapshot_extra = first_class_list.snapshot_if_changed
      expect(first_snapshot).not_to eq nil
      expect(first_snapshot_extra).to eq nil

      # revision
      second_class_list = create_class_list_with({
        'room:unplaced': [],
        'room:0': [pals.healey_kindergarten_student.id]
      })
      second_snapshot = second_class_list.snapshot_if_changed
      second_snapshot_extra = second_class_list.snapshot_if_changed
      expect(second_snapshot).not_to eq nil
      expect(second_snapshot_extra).to eq nil
      expect(ClassListSnapshot.all.size).to eq(2)

      # drift in underlying student data causes snapshot
      # for second list
      pals.healey_kindergarten_student.update!(last_name: 'Paley')
      third_snapshot = second_class_list.snapshot_if_changed
      third_snapshot_extra = second_class_list.snapshot_if_changed
      expect(third_snapshot).not_to eq nil
      expect(third_snapshot_extra).to eq nil
      expect(ClassListSnapshot.all.size).to eq(3)
      diffs = ClassListSnapshot.diffs_across_workspaces
      expect(diffs).to eq([{
        :workspace_id=>"foo-workspace-id",
        :first=>first_snapshot.id,
        :last=>third_snapshot.id,
        :diff=>[{
          "op"=>"replace",
          "path"=>"/0/last_name",
          "value"=>"Paley"
        }
      ]}])
    end
  end
end
