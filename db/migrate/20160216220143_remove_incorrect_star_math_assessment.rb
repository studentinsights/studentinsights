class RemoveIncorrectStarMathAssessment < ActiveRecord::Migration[4.2]
  def change
    # "STAR Math" => incorrect
    # "STAR Mathematics" => correct
    begin
      incorrect = Assessment.find_by_family_and_subject("STAR", "Math")
      unless incorrect.nil?
        incorrect.destroy!
        Student.update_recent_student_assessments!
      end
    rescue ActiveRecord::RecordNotFound
    end
  end
end
