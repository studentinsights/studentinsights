require 'spec_helper'

RSpec.describe ClassListSnapshot do
  let!(:pals) { TestPals.create! }

  describe '.snapshot_all_workspaces' do
    it 'calls snapshot_if_changed on all workspaces' do
      class_list = ClassList.create({
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
end
