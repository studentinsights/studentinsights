class EducatorSearchbar < ApplicationRecord
  belongs_to  :educator
  validates :educator, presence: true, uniqueness: true
  validate :validate_student_searchbar_json

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
      []
    end
  end

  # Update
  def self.update_student_searchbar_json!(educator)
    student_searchbar_json = EducatorSearchbar.names_for_json(educator)
    educator_searchbar = EducatorSearchbar.find_or_initialize_by(educator_id: educator.id)
    educator_searchbar.update!(student_searchbar_json: student_searchbar_json)
    student_searchbar_json
  end

  # Do the actual computation
  def self.names_for_json(educator)
    authorized_students = Authorizer.new(educator).authorized { Student.active.to_a }
    json_records = authorized_students.map do |student|
      {
        id: student.id,
        label: "#{student.first_name} #{student.last_name} - #{student.school.local_id} - #{student.grade}"
      }.as_json
    end
    json_records.sort_by {|j| j[:label]}.reverse!
  end

  private

  def validate_student_searchbar_json
    errors.add(:student_searchbar_json, 'nil') if self.student_searchbar_json.nil?
  end
end
