class ClassList < ActiveRecord::Base
  belongs_to :school
  belongs_to :created_by_educator, class_name: 'Educator'

  validates :grade_level_next_year, presence: true
  validates :school_id, presence: true
  validates :created_by_educator_id, presence: true
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
    # Optimized SQL group by for many workspace_id records
    groups_by_school_and_grade = ClassList
      .where(workspace_id: workspace_id)
      .group(:school_id, :grade_level_next_year)
      .count

    # There already is a validation violation, abort
    if groups_by_school_and_grade.keys.size > 1
      errors.add(:grade_level_next_year, "preexisting violation, different grade_level_next_year values for same workspace_id")
      errors.add(:school_id, "preexisting violation, different school_id values for same workspace_id")
    end

    # We're trying to write something different that what is already there
    school_id, grade_level_next_year = groups_by_school_and_grade.values
    if school_id != self.school_id
      errors.add(:school_id, "cannot add different school_id to existing workspace_id")
    end
    if grade_level_next_year != self.grade_level_next_year
      errors.add(:grade_level_next_year, "cannot add different grade_level_next_year to existing workspace_id")
    end
  end

  # Only one writer can write to a workspace
  def validate_single_writer_in_workspace
    puts '  validate_single_writer_in_workspace'
    # Optimized SQL group by for many workspace_id records
    groups_by_created_by_educator_id = ClassList
      .where(workspace_id: workspace_id)
      .group(:created_by_educator_id)
      .count

    puts "  ClassList.all.as_json: #{ClassList.all.as_json}"
    puts "  groups_by_created_by_educator_id: #{groups_by_created_by_educator_id}"
    puts "  groups_by_created_by_educator_id.values: #{groups_by_created_by_educator_id.values}"
    # There already is a violation
    if groups_by_created_by_educator_id.keys.size > 1
      errors.add(:created_by_educator_id, "preexisting violation, different created_by_educator_id for existing workspace_id")
    end

    # We are about to violate
    other_educator_id = groups_by_created_by_educator_id.values.first
    if other_educator_id.present? && other_educator_id != self.created_by_educator_id
      errors.add(:created_by_educator_id, "cannot add record with different created_by_educator_id for existing workspace_id")
    end
  end
end
