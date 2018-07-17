class Herfindahl
  # The share of "whiteness" etc.
  def self.default_dimensions
    {
      iep_or_504: Proc.new {|student| student.disability.present? || student.plan_504 == '504' },
      limited_or_flep: Proc.new {|student| ['Limited', 'FLEP'].include?(student.limited_english_proficiency) },
      male: Proc.new {|student| student.gender == 'M' },
      reduced_lunch: Proc.new {|student| ['Free Lunch', 'Reduced Lunch'].include?(student.free_reduced_lunch) },
      high_discipline: Proc.new {|student| student.most_recent_school_year_discipline_incidents_count >= 3 },
      whiteness: Proc.new {|student| student.race == 'White' },
      color: Proc.new {|student| student.race != 'White' && !student.hispanic_latino },
    }
  end

  def with_dimensions_json(workspaces, options = {})
    dimensions = options.fetch(:dimensions, Herfindahl.default_dimensions)
    submitted_class_lists = workspaces.map(&:class_list).select(&:submitted)

    class_lists_with_dimensions_json = submitted_class_lists.map do |class_list|
      dimensions_json = dimensions.map do |dimension_key, dimension_block|
        index = Herfindahl.new.index(class_list, dimension_block)
        { dimension_key: dimension_key, index: index }
      end

      { dimensions: dimensions_json }.merge(class_list.as_json({
        only: [
          :id,
          :workspace_id,
          :grade_level_next_year,
          :created_at,
          :updated_at,
          :submitted
        ],
        include: {
          created_by_teacher_educator: {
            only: [:id, :email, :full_name]
          },
          revised_by_principal_educator: {
            only: [:id, :email, :full_name]
          },
          school: {
            only: [:id, :name]
          }
        }
      }))
    end

    {
      dimension_keys: dimensions.keys,
      class_lists_with_dimensions: class_lists_with_dimensions_json
    }
  end

  def index(class_list, group_by_block)
    herfindahl_for_class_list(class_list, group_by_block)
  end

  private
  def herfindahl_for_class_list(class_list, group_by_block)
    teacher_herfindahl = herfindahl_from_student_ids_by_room(class_list.json['studentIdsByRoom'], group_by_block)
    # principal_herfindahl = herfindahl_from_student_ids_by_room(class_list.principal_revisions_json['principalStudentIdsByRoom'], group_by_block)
    # delta = if principal_herfindahl.present?
    #   principal_herfindahl[:herfindahl] - teacher_herfindahl[:herfindahl]
    # else
    #   nil
    # end

    # {
    #   delta: delta,
    #   teacher_herfindahl: teacher_herfindahl,
    #   principal_herfindahl: principal_herfindahl,
    # }

    teacher_herfindahl
  end

  def herfindahl_from_student_ids_by_room(student_ids_by_room, group_by_block)
    return nil if student_ids_by_room.nil? || student_ids_by_room.empty?
    groups = groups_from_class_list(student_ids_by_room)
    herfindahl_for_groups(groups, group_by_block)
  end

  def groups_from_class_list(rooms)
    groups_with_unplaced = rooms.map do |room_key, student_ids|
      {
        room_key: room_key,
        students: Student.where(id: student_ids)
      }
    end
    groups_with_unplaced.select {|group| group[:room_key] != 'room:unplaced' }
  end

  def herfindahl_for_groups(groups, group_by_block)
    all_students = groups.map {|group| group[:students] }.flatten
    total_count = all_students.select {|student| group_by_block.call(student) }.size
    groups_with_share = groups.map do |group|
      count = group[:students].select {|student| group_by_block.call(student) }.size
      {
        count: count,
        share: (count / total_count.to_f).round(2),
        room_key: group[:room_key]
      }
    end
    {
      herfindahl: herfindahl(groups_with_share.map {|group| group[:share] }),
      groups_with_share: groups_with_share
    }
  end

  def herfindahl(shares)
    shares.sum {|share| share * share }
  end
end
