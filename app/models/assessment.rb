class Assessment < ActiveRecord::Base
  has_many :student_assessments, -> (student) { extending FindByStudent }

  def self.mcas_ela; where(family: "MCAS", subject: "ELA").last_or_missing end

  def self.mcas_math; where(family: "MCAS", subject: "Math").last_or_missing end

  def self.star_math; where(family: "STAR", subject: "Math").last_or_missing end

  def self.star_reading; where(family: "STAR", subject: "Reading").last_or_missing end

  def self.map_test; where(family: "MAP").last_or_missing end

  def self.dibels; where(family: "DIBELS").last_or_missing end

  def self.access; where(family: "ACCESS").last_or_missing end

  def self.math; where(subject: "Math").all_or_missing end

  def self.mcas; where(family: "MCAS").all_or_missing end

  def self.star; where(family: "STAR").all_or_missing end

  def self.ela; where(subject: "ELA").all_or_missing end

  def self.reading; where(subject: "Reading").all_or_missing end

  def self.last_or_missing; last || MissingAssessment.new end

  def self.all_or_missing; present? ? all : MissingAssessment.new end

end
