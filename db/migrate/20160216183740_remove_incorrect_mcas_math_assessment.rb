class RemoveIncorrectMcasMathAssessment < ActiveRecord::Migration
  def change
    # "MCAS Math" => incorrect
    # "MCAS Mathematics" => correct
    begin
      incorrect = Assessment.find_by_family_and_subject("MCAS", "Math")
      incorrect.destroy! unless incorrect.nil?
    rescue ActiveRecord::RecordNotFound
    end
  end
end
