class Assessment < ActiveRecord::Base
  VALID_FAMILY_VALUES = [
    'MCAS',
    'Next Gen MCAS',
    'ACCESS'
  ]
  VALID_MCAS_SUBJECTS = [ 'ELA', 'Mathematics' ].freeze
  VALID_ACCESS_SUBJECTS = [
    "Composite", "Comprehension", "Literacy", "Oral",
    "Listening", "Reading", "Speaking", "Writing"
  ].freeze

  has_many :student_assessments, dependent: :destroy
  has_many :students, through: :student_assessments
  validate :has_valid_subject
  validates :family, inclusion: { in: VALID_FAMILY_VALUES }

  def has_valid_subject
    case family
    when 'MCAS'
      errors.add(:subject, "invalid MCAS subject") unless subject.in?(VALID_MCAS_SUBJECTS)
    when 'ACCESS'
      errors.add(:subject, "invalid ACCESS subject") unless subject.in?(VALID_ACCESS_SUBJECTS)
    end
  end

  def self.seed_for_all_districts
    Assessment.destroy_all
    Assessment.create!([
      { family: "MCAS", subject: "Mathematics" },
      { family: "MCAS", subject: "ELA" },
      { family: "Next Gen MCAS", subject: "Mathematics" },
      { family: "Next Gen MCAS", subject: "ELA" },
      { family: "ACCESS", subject: "Composite" },
      { family: "ACCESS", subject: "Comprehension" },
      { family: "ACCESS", subject: "Literacy" },
      { family: "ACCESS", subject: "Oral" },
      { family: "ACCESS", subject: "Listening" },
      { family: "ACCESS", subject: "Reading" },
      { family: "ACCESS", subject: "Speaking" },
      { family: "ACCESS", subject: "Writing" }
    ])
  end

end
