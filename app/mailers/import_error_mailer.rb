class ImportErrorMailer < ActionMailer::Base

  def error_report(error)
    @target_emails = ENV['IMPORT_ERROR_MAILER_LIST'].split(',')
    @subject = "Student Insights import error"
    @error_message = error.message
    @error_backtrace = error.backtrace

    mail(
      to: @target_emails,
      subject: @subject,
      from: "Student Insights error report <asoble@gmail.com>"
    )
  end

end
