class ClassListSnapshot < ActiveRecord::Base
  belongs_to :class_list

  validates :class_list, presence: true

  # Across all workspaces, creates new ClassListSnapshots for any student data
  # that has changed.  This is to track changes as student data changes over time,
  # while the student_ids in the class list record stay the same.
  def self.snapshot_all_workspaces(options = {})
    log = options[:log] || STDOUT
    snapshots_taken = []

    log.puts "ClassListSnapshot.snapshot_all_workspaces: starting..."
    workspaces = ClassList.unsafe_all_workspaces_without_authorization_check
    log.puts "  snapshot_all_workspaces: Found #{workspaces.size} workspaces."
    ClassList.unsafe_all_workspaces_without_authorization_check.each do |workspace|
      log.puts "  snapshot_all_workspaces: Checking workspace #{workspace.workspace_id}..."
      snapshot = workspace.class_list.snapshot_if_changed
      if snapshot.present?
        log.puts "  snapshot_all_workspaces: created snapshot."
        snapshots_taken << {
          snapshot: snapshot,
          workspace_id: workspace.workspace_id,
          class_list_id: workspace.class_list.id
        }
      end
    end
    log.puts "  snapshot_all_workspaces: created #{snapshots_taken.size} snapshots."
    log.puts "ClassListSnapshot.snapshot_all_workspaces: done."

    snapshots_taken
  end

  # Look at actual substantive diffs in students_json across workspaces.
  # There's some duplication in the storage here, because it's done
  # referencing each class_list revision (not the workspace as a whole).
  #
  # This means that the list of students can drift from revisiont to revision
  # as students are added or withdrawn, which the snapshotting code handles
  # by conversatively snapshotting each revision independently.
  # So when looking at data, as revisions are made, they are snapshotted
  # independently, which means there are more snapshot records
  # than there would be if we were snapshotting the workspace itself.
  #
  # Returns a list of diffs across workspaces where there are multiple
  # snapshots.  These may be empty, reflecting that the snapshotting
  # was conservative and generated at the time of the revision.
  def self.diffs_across_workspaces
    ordered_snapshots = ClassListSnapshot.all.order(created_at: :asc)
    snapshots_by_workspace = ordered_snapshots.group_by do |snapshot|
      snapshot.class_list.workspace_id
    end

    snapshots_by_workspace.flat_map do |key, snapshots|
      if snapshots.size < 2
        []
      else
        first = snapshots.first
        last = snapshots.last
        [{
          workspace_id: first.class_list.workspace_id,
          first: first.id,
          last: last.id,
          diff: JsonDiff.diff(first.students_json, last.students_json)
        }]
      end
    end
  end
end
