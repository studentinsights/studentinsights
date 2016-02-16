class RemoveIncorrectMcasMathAssessment < ActiveRecord::Migration
  def change
    # "MCAS Math" => incorrect
    # "MCAS Mathematics" => correct
    begin
      Assessment.find_by_family_and_subject("MCAS", "Math").destroy!
    rescue ActiveRecord::RecordNotFound
    end
  end
end
