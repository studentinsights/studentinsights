class ClassListSnapshot < ActiveRecord::Base
  belongs_to :class_list

  # Returns a new ClassListSnapshot or nil if nothing has changed
  def self.snapshot_all_workspaces(educator)
    queries = ClassListQueries.new(educator)
    workspaces = queries.all_authorized_workspaces

    snapshots_taken = []
    workspaces.each do |workspace|
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
