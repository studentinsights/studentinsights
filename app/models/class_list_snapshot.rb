class ClassListSnapshot < ActiveRecord::Base
  belongs_to :class_list

  validates :class_list, presence: true

  # Across all workspaces, creates new ClassListSnapshots for any student data
  # that has changed.  This is to track changes as student data changes over time,
  # while the student_ids in the class list record stay the same.
  def self.snapshot_all_workspaces
    snapshots_taken = []

    puts "ClassListSnapshot.snapshot_all_workspaces: starting..."
    workspaces = ClassList.unsafe_all_workspaces_without_authorization_check
    puts "  snapshot_all_workspaces: Found #{workspaces.size} workspaces."
    ClassList.unsafe_all_workspaces_without_authorization_check.each do |workspace|
      puts "  snapshot_all_workspaces: Checking workspace #{workspace.workspace_id}..."
      snapshot = workspace.class_list.snapshot_if_changed
      if snapshot.present?
        puts "  snapshot_all_workspaces: created snapshot."
        snapshots_taken << {
          snapshot: snapshot,
          workspace_id: workspace.workspace_id,
          class_list_id: workspace.class_list.id
        }
      end
    end
    puts "  snapshot_all_workspaces: created #{snapshots_taken} snapshots."
    puts "ClassListSnapshot.snapshot_all_workspaces: done."

    snapshots_taken
  end
end
