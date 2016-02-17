class Assessment < ActiveRecord::Base
  has_many :student_assessments, dependent: :destroy
  has_many :students, through: :student_assessments
  validate :valid_mcas_subject, :valid_star_subject, :valid_dibels

  VALID_MCAS_SUBJECTS = [ 'ELA', 'Mathematics', 'Science', 'Arts', 'Technology' ].freeze
  VALID_STAR_SUBJECTS = [ 'Mathematics', 'Reading' ].freeze

  def valid_mcas_subject
    errors.add(:subject, "must be a valid MCAS subject") if family == 'MCAS' &&
                                                            !subject.in?(VALID_MCAS_SUBJECTS)
  end

  def valid_star_subject
    errors.add(:subject, "must be a valid STAR subject") if family == 'STAR' &&
                                                            !subject.in?(VALID_STAR_SUBJECTS)
  end

  def valid_dibels
    errors.add(:subject, "DIBELS has no subject") if family == 'DIBELS' && !subject.nil?
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
