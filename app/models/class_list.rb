class ClassList < ActiveRecord::Base
  belongs_to :school
  belongs_to :created_by_educator, class_name: 'Educator'

  validates :grade_level_next_year, presence: true
  validates :school_id, presence: true
  validates :created_by_educator_id, presence: true
  validate :validate_consistent_workspace_grade_school
  validate :validate_single_writer_in_workspace

  # A workspace is owned by one educator, or no one yet (nil)
  def self.workspace_owner(workspace_id)
    ClassList.all
      .where(workspace_id: workspace_id)
      .map(&:created_by_educator)
      .first
  end

  private
  # These shouldn't change over the life of a workspace
  def validate_consistent_workspace_grade_school
    class_lists = ClassList.where(workspace_id: workspace_id)

    grade_conflicts = []
    school_conflicts = []
    class_lists.each do |class_list|
      grade_conflicts << class_list if class_list.grade_level_next_year != grade_level_next_year
      school_conflicts << class_list if class_list.school_id != school_id
    end
    if grade_conflicts.size > 0
      errors.add(:grade_level_next_year, "cannot add different grade_level_next_year to existing workspace_id")
    end
    if school_conflicts.size > 0
      errors.add(:school_id, "cannot add different school_id to existing workspace_id")
    end
  end

  # Only one writer can write to a workspace
  def validate_single_writer_in_workspace
    owner = ClassList.workspace_owner(workspace_id)
    if owner.present? && owner.id != created_by_educator_id
      errors.add(:created_by_educator_id, "cannot add record with different created_by_educator_id for existing workspace_id")
    end
  end
end
