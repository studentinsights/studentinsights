class ClassListSnapshot < ActiveRecord::Base
  belongs_to :class_list

  validates :class_list, presence: true

  # Across all workspaces, creates new ClassListSnapshots for any student data
  # that has changed.  This is to track changes as student data changes over time,
  # while the student_ids in the class list record stay the same.
  def self.snapshot_all_workspaces
    snapshots_taken = []

    ClassList.unsafe_all_workspaces_without_authorization_check.each do |workspace|
      snapshot = workspace.class_list.snapshot_if_changed
      if snapshot.present?
        snapshots_taken << {
          snapshot: snapshot,
          workspace_id: workspace.workspace_id,
          class_list_id: workspace.class_list.id
        }
      end
    end

    snapshots_taken
  end
end
