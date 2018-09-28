class IepDocument < ActiveRecord::Base
  belongs_to :student
  validates :file_name, presence: true, uniqueness: true
  validate :validate_file_name

  # Shown to end users
  def pretty_filename_for_download
    student_name = "#{student.last_name} #{student.first_name}"
    escaped_student_name = student_name.gsub(/[^a-zA-Z0-9]+/, '')
    date_text = self.created_at.strftime('%Y%m%d')
    "IEP_#{student.id}_#{escaped_student_name}_#{date_text}.pdf"
  end

  def self.parse_local_id(file_name)
    self.parse_file_name(file_name).try(:[], :local_id)
  end

  def self.parse_file_name(file_name)
    basename = file_name.split('.pdf')[0]
    return nil if basename.nil?
    local_id, iep_at_a_glance, *names = basename.split('_')
    return nil if iep_at_a_glance != 'IEPAtAGlance'
    {
      local_id: local_id,
      names: names
    }
  end

  private
  def validate_file_name
    puts 'validate_file_name'
    puts self.attributes
    local_id_from_file_name = IepDocument.parse_local_id(self.file_name)
    if local_id_from_file_name.nil?
      errors.add(:file_name, 'could not be parsed')
    elsif local_id_from_file_name != self.student.local_id
      errors.add(:student_id, 'reference does not match local_id in filename')
    end
  end
end
