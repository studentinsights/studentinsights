# Within a `workspace_id`, there are multiple ClassList records
# holding states over time.  There might be hundreds of ClassList records
# within a single `workspace_id` if a teacher is making many revisions.
#
# These records are always restricted to a single teacher writing them.
# When that teachers submits, the school principal can then revise the list,
# with each revision being a new ClassList record as well.  When the principal
# is revising, this is stored in separate fields, and the principal can't change
# what the teacher has already done.
class ClassList < ActiveRecord::Base
  belongs_to :school
  belongs_to :created_by_teacher_educator, class_name: 'Educator'
  belongs_to :revised_by_principal_educator, class_name: 'Educator'

  validates :grade_level_next_year, presence: true
  validates :school_id, presence: true
  validates :created_by_teacher_educator_id, presence: true
  validate :validate_consistent_workspace_grade_school
  validate :validate_single_writer_in_workspace

  # Within a `workspace_id`, there are multiple ClassList records
  # holding states over time.  This grabs the latest.
  def self.latest_class_list_for_workspace(workspace_id)
    ClassList.all
      .where(workspace_id: workspace_id)
      .order(created_at: :desc)
      .limit(1)
      .first
  end

  private
  # These shouldn't change over the life of a workspace, so if we find
  # any workspace_id records with different grade or school, fail the validation.
  def validate_consistent_workspace_grade_school
    validate_consistent_values_within_workspace([:school_id, :grade_level_next_year])
  end

  # Only one writer can write to a workspace
  def validate_single_writer_in_workspace
    validate_consistent_values_within_workspace([:created_by_teacher_educator_id])
  end

  # This checks that particular values are consistent across all records
  # within a `workspace_id`. It's a different check than a uniqueness
  # constraint because having multiple records is okay, they just have to have
  # the same value for particular fields.
  #
  # This complexity arises from having a single endpoint for the client to write
  # updates, and storing those different states of the workspace denormalized
  # in a single table.
  def validate_consistent_values_within_workspace(grouping_fields, options = {})
    # SQL group is optimized for many workspace_id records
    grouped_by_fields = ClassList
      .where(workspace_id: workspace_id)
      .group(*grouping_fields)
      .count

    # No other records for the workspace
    return if grouped_by_fields.keys.size == 0

    # There already is a validation violation in the database, abort.
    if grouped_by_fields.keys.size != 1
      grouping_fields.each do |grouping_field|
        errors.add(grouping_field, "preexisting violation, different (#{grouping_fields.join(',')}) pair in existing workspace_id")
      end
      return
    end

    # We're trying to write something that would be a violation
    # Rails' `group` method will return one shape if it's one field (key => count),
    # a different shape if it's multiple fields ([key] => count).  This
    # normalizes both.
    existing_values = [grouped_by_fields.keys.first].flatten
    existing_values.each_with_index do |existing_value, index|
      grouping_field = grouping_fields[index]
      proposed_value = self.send(grouping_field)
      if proposed_value.present? && proposed_value != existing_value
        errors.add(grouping_field, "cannot add different #{grouping_field} to existing workspace_id")
      end
    end
  end
end
