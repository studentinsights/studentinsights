class IepDocument < ActiveRecord::Base
  belongs_to :student
  validates :file_name, presence: true, uniqueness: true
  validate :validate_file_name

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
    local_id_from_file_name = IepDocument.parse_local_id(self.file_name)
    if local_id_from_file_name.nil?
      errors.add(:file_name, 'could not be parsed')
    elsif local_id_from_file_name != self.student.local_id
      errors.add(:student_id, 'reference does not match local_id in filename')
    end
  end
end
