class ImportRecord < ActiveRecord::Base
  has_many :import_record_details

  def completed?
    time_ended.present?
  end

  def time_to_complete
    time_ended - time_started
  end

end
