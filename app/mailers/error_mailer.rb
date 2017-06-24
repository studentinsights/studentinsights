class ErrorMailer < ActionMailer::Base

  def error_report(error)
    @target_emails = ENV['ERROR_MAILER_LIST'].split(',')
    @subject = "ERROR: Student Insights ErrorMailer"
    @error_message = error.message
    @error_backtrace = error.backtrace

    mail(
      to: @target_emails,
      subject: @subject,
      from: "Student Insights ErrorMailer <asoble@gmail.com>"
    )
  end

end
