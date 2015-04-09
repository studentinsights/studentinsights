class Student < ActiveRecord::Base
  belongs_to :room, counter_cache: true
  belongs_to :school
  has_many :student_results, dependent: :destroy
  has_many :assessments, through: :student_results

  def self.default_sort(room)
    risk = { "Low" => [], "Medium" => [], "High" => [] }
    if room.present?
      room.students.each do |s|
        result = s.student_results.last
        if result.warning?
          risk["High"] << s
        elsif result.ela_performance == "NI" || result.math_performance == "NI"
          risk["Medium"] << s
        else
          risk["Low"] << s
        end
      end
    end
    return risk
  end
end