class Interventions < Thor
  desc "analyze", "Perform some analysis about interventions"

  def analyze
    require './config/environment'
    require 'csv'

    risk_level_3 = StudentRiskLevel.where(level: 3).map { |s| s.student }
    student_list = risk_level_3.sort do |a, b|
      [a.grade.to_i, a.most_recent_atp_hours] <=> [b.grade.to_i, b.most_recent_atp_hours]
    end

    CSV.open("#{Rails.root}/tmp/healey_atp_report.csv", "wb") do |csv|
      csv << ["name", "grade", "risk level", "hours of ATP tutoring, 2014-15"]
      student_list.each do |s|
        csv << [
          StudentPresenter.new(s).full_name,
          s.grade,
          s.student_risk_level.level,
          s.most_recent_atp_hours
        ]
      end
    end
  end
end
