class ClassListText
  def initialize(class_list)
    @class_list = class_list
  end

  # This is dangerous since it ignore authorizations rules,
  # which are complicated for class lists depending on the time of the year.
  def dangerously_render_as_text
    output = []

    output << "Class list: (#{@class_list.workspace_id}:#{@class_list.id})"
    output << '------------------------------------------------'
    output << "School: #{@class_list.school.name}"
    output << "Grade level (rising): #{@class_list.grade_level_next_year}"
    output << "Created by: #{@class_list.created_by_teacher_educator.full_name}"
    output << "Submitted to principal? #{@class_list.submitted}"
    output << "Revised by: #{@class_list.revised_by_principal_educator.try(:full_name) || 'not revised'}"
    output << "Last updated at: #{@class_list.updated_at}"
    output << ""
    output << ""

    output << 'Teaching team, plan and notes'
    output << '------------------------------------------------'
    output << "Classrooms created: #{@class_list.json['classroomsCount']}"
    output << "Teaching team:\n  #{authors_text(@class_list)}"
    output << ""
    output << "Teaching team's plan:\n#{@class_list.json['planText']}"
    output << ""
    output << "Notes to principal:\n#{@class_list.json['principalNoteText']}"
    output << ""
    output << ""

    output << "Teaching team's class lists:"
    output << '------------------------------------------------'
    output += lines_for_class_list_rosters(@class_list.json)

    output << "Principal's revised class lists:"
    output << '------------------------------------------------'
    output += lines_for_class_list_rosters(@class_list.principal_revisions_json)
    output << ""
    output << ""

    output.join("\n")
  end

  private
  def lines_for_class_list_rosters(json)
    output = []

    if json.nil?
      return ['No data']
    end
    student_ids_by_room = json['studentIdsByRoom']
    if student_ids_by_room.nil?
      return ['No data']
    end

    student_ids_by_room.keys.each do |room_key|
      room_number = room_key.split(':')[1]
      room_text = if room_number == 'unplaced'
        'Not yet placed'
      else
        "Room #{(room_number.to_i+65).chr}"
      end
      output << room_text
      output << '============'
      students = Student.where(id: student_ids_by_room[room_key])
      students.sort_by {|student| "#{student.last_name}, #{student.first_name}" }.each do |student|
        output << "#{student.last_name}, #{student.first_name}"
      end
      output << ""
    end
    output << ""
    output << ""

    ('  ' + output.join("\n  ")).split("\n") # indent
  end

  def indent(text)
    indented = text.split("\n").join("\n  ")
    "  #{indented}"
  end

  def authors_text(class_list)
    educators_json = @class_list.json['authors'] || []
    educators_json.map {|json| json['full_name']}.join("\n  ")
  end
end
