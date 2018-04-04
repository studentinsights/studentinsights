class ImportRecord < ActiveRecord::Base

  def completed?
    time_ended.present?
  end

  def time_to_complete
    time_ended - time_started
  end

  def time_started_display
    time_to_display(time_to_est(time_started))
  end

  def time_ended_display
    time_to_display(time_to_est(time_ended))
  end

  private

    def time_to_est(time)
      time.in_time_zone('Eastern Time (US & Canada)')
    end

    def time_to_display(time)
      time.strftime("%m/%d/%Y %l:%M %p")
    end

end
