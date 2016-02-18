class Assessment < ActiveRecord::Base
  has_many :student_assessments, dependent: :destroy
  has_many :students, through: :student_assessments
  validate :has_valid_subject

  VALID_MCAS_SUBJECTS = [ 'ELA', 'Mathematics', 'Science', 'Arts', 'Technology' ].freeze
  VALID_STAR_SUBJECTS = [ 'Mathematics', 'Reading' ].freeze

  def has_valid_subject
    case family
    when 'MCAS'
      errors.add(:subject, "must be a valid MCAS subject") unless subject.in?(VALID_MCAS_SUBJECTS)
    when 'STAR'
      errors.add(:subject, "must be a valid STAR subject") unless subject.in?(VALID_STAR_SUBJECTS)
    when 'DIBELS'
      errors.add(:subject, "DIBELS has no subject") unless subject.nil?
    end
  end

  def self.seed_somerville_assessments
    Assessment.create!([
      { family: "MCAS", subject: "Mathematics" },
      { family: "MCAS", subject: "ELA" },
      { family: "STAR", subject: "Mathematics" },
      { family: "STAR", subject: "Reading" },
      { family: "ACCESS" },
      { family: "DIBELS" }
    ])
  end

end
