class ImportRecord < ActiveRecord::Base

  def completed?
    time_ended.present?
  end

  def time_to_complete
    time_ended - time_started
  end

end
