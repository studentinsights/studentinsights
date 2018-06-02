class ErrorMailer < ActionMailer::Base

  def error_report(error, extra_info = nil)
    @target_emails = ENV['ERROR_MAILER_LIST'].split(',')
    @subject = "ERROR: Student Insights ErrorMailer (#{PerDistrict.new.district_key})"
    @error_message = error.message
    @error_backtrace = error.backtrace || []
    @extra_info = extra_info

    mail(
      to: @target_emails,
      subject: @subject,
      from: "Student Insights ErrorMailer <asoble@gmail.com>"
    )
  end

end
