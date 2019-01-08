# For analysis of class list placements, drift, and exploratory analysis around equity
# and diversity.
#
# This only produces anonymized data but contains enough information that it could be used to
# re-identify individual students if it were mistakenly shared.  Data should be shared only in secure
# district data storage systems, and only with team members who have completed the appropriate data
# sharing agreements for anonymized data.
#
# Usage: ClassListAnalysisExport.new.print_analysis_csv('4')
class ClassListAnalysisExport
  def print_analysis_csv(grade_level_next_year)
    delim = '|'
    workspaces = ClassList.unsafe_all_workspaces_without_authorization_check
    workspaces_for_grade = workspaces.select {|w| w.class_list.grade_level_next_year == grade_level_next_year && w.class_list.submitted }

    puts 'Processing...'
    records = []
    workspaces_for_grade.each do |workspace|
      puts "  working on workspace #{workspace.workspace_id}..."
      records += sheet(workspace.class_list)
    end
    puts "Done processing, formatting output..."
    puts
    puts
    output = ([header] + records.map {|record| to_line(record) }).map {|line| line.join(delim) }.join("\n")
    puts output
    nil
  end

  private
  def sheet(class_list)
    records = []

    student_ids_by_room = class_list.json['studentIdsByRoom']
    student_ids_by_room.each do |teacher_room_key, student_ids|
      student_ids.each do |student_id|
        records << {
          class_list: class_list,
          teacher_room_key: teacher_room_key,
          principal_room_key: find_principal_room_key(class_list, student_id),
          student_id: student_id
        }
      end
    end

    records
  end

  def find_principal_room_key(class_list, target_student_id)
    return nil if class_list.principal_revisions_json.nil?
    student_ids_by_room = class_list.principal_revisions_json['principalStudentIdsByRoom']
    return nil if student_ids_by_room.nil?

    student_ids_by_room.each do |principal_room_key, student_ids|
      student_ids.each do |student_id|
        return principal_room_key if student_id == target_student_id
      end
    end
    nil
  end

  def snapshot_json(class_list_id, student_id)
    snapshot = ClassListSnapshot.where(class_list_id: class_list_id).order(created_at: :asc).limit(1).first
    (snapshot.try(:students_json) || []).find {|json| student_id == json['id'] }
  end

  def dibels_code(dibels)
    return nil if dibels.nil?
    text = dibels['performance_level']
    return nil if text.nil?
    text.split(' ')[0]
  end

  def header
    [
      'class_list_id',
      'school_id',
      'grade_level_next_year',
      '/',
      'teacher_class_list_placement',
      'principal_class_list_placement',
      'homeroom_id_today',
      '/',
      'student_id',
      'gender',
      'race',
      'hispanic?',
      'free_reduced_lunch',
      'home_language',
      'iep_document?',
      'limited_english_proficiency',
      'plan_504',
      'latest_dibels_composite',
      'most_recent_star_reading_percentile',
      'most_recent_star_math_percentile',
      'most_recent_school_year_discipline_incidents_count'
    ]
  end

  def to_line(record)
    class_list = record[:class_list]
    json = snapshot_json(class_list.id, record[:student_id])

    [
      class_list.id,
      class_list.school_id,
      class_list.grade_level_next_year,
      '/',
      record[:teacher_room_key],
      record[:principal_room_key],
      Student.find(json['id']).homeroom_id,
      '/',
      json['id'],
      json['gender'],
      json['race'],
      json['hispanic_latino'],
      json['free_reduced_lunch'],
      json['home_language'],
      json['iep_document'].present?,
      json['limited_english_proficiency'],
      json['plan_504'],
      dibels_code(json['latest_dibels']),
      json['most_recent_star_reading_percentile'],
      json['most_recent_star_math_percentile'],
      json['most_recent_school_year_discipline_incidents_count']
    ]
  end
end
