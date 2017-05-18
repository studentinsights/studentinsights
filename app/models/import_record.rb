class ImportRecord < ActiveRecord::Base

  def completed?
    record.time_ended.present?
  end

  def time_to_complete
    record.time_ended - record.time_started
  end

end
