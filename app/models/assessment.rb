class Assessment < ActiveRecord::Base
  has_many :student_assessments, dependent: :destroy
  has_many :students, through: :student_assessments

  def self.seed_somerville_assessments
    Assessment.create!([
      { family: "MCAS", subject: "Mathematics" },
      { family: "MCAS", subject: "ELA" },
      { family: "STAR", subject: "Math" },
      { family: "STAR", subject: "Reading" },
      { family: "ACCESS" },
      { family: "DIBELS" }
    ])
  end

end
