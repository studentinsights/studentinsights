class EducatorSearchbar < ApplicationRecord
  belongs_to  :educator
  validates :educator, presence: true, uniqueness: true
  validates :student_searchbar_json, presence: true

  # Read the cached value, optionally computing if it's missing
  def self.student_searchbar_json_for(educator, options = {})
    educator_searchbar = EducatorSearchbar.find_by_educator_id(educator.id)

    if educator_searchbar.present?
      educator_searchbar.student_searchbar_json
    elsif options[:compute_if_missing]
      Rollbar.info('EducatorSearchbar#student_searchbar_json_for compute_if_missing=true')
      EducatorSearchbar.update_student_searchbar_json!(educator)
    else
      Rollbar.info('EducatorSearchbar#student_searchbar_json_for compute_if_missing=false')
      '[]'
    end
  end

  # Update
  def self.update_student_searchbar_json!(educator)
    student_searchbar_json = EducatorSearchbar.names_for(educator).to_json
    educator_searchbar = EducatorSearchbar.find_or_initialize_by(educator_id: educator.id)
    educator_searchbar.update!(student_searchbar_json: student_searchbar_json)
    student_searchbar_json
  end

  # Do the computation
  def self.names_for(educator)
    authorized_students = Authorizer.new(educator).authorized do
      Student.active.with_school
    end
    authorized_students.map do |student|
      {
        label: "#{student.first_name} #{student.last_name} - #{student.school.local_id} - #{student.grade}",
        id: student.id
      }
    end
  end
end
