require 'spec_helper'

RSpec.describe LoginChecker do
  let!(:pals) { TestPals.create! }

  it '#alert_if_suspicious reports to Rollbar on :first_login_after_year' do
    LoginActivity.create!({
      user_id: pals.healey_vivian_teacher.id,
      created_at: pals.time_now - 2.years
    })

    allow(Rollbar).to receive(:error)
    expect(Rollbar).to receive(:error).once.with('LoginChecker#alert_if_suspicious', {
      flags: [:first_login_after_year],
      warning_id: anything(),
      time_now: pals.time_now.to_i
    })
    checker = LoginChecker.new(pals.healey_vivian_teacher, time_now: pals.time_now)
    expect(checker.alert_if_suspicious).to eq [:first_login_after_year]
  end

  it '#alert_if_suspicious reports to Rollbar on :first_login_month_after_creation' do
    pals.healey_vivian_teacher.update!(created_at: pals.time_now - 32.days)

    allow(Rollbar).to receive(:error)
    expect(Rollbar).to receive(:error).once.with('LoginChecker#alert_if_suspicious', {
      flags: [:first_login_month_after_creation],
      warning_id: anything(),
      time_now: pals.time_now.to_i
    })
    checker = LoginChecker.new(pals.healey_vivian_teacher, time_now: pals.time_now)
    expect(checker.alert_if_suspicious).to eq [:first_login_month_after_creation]
  end

  it '#with_isolation works' do
    allow(Rollbar).to receive(:error)
    expect(Rollbar).to receive(:error).once.with('LoginChecker#with_isolation rescued', {
      error_class: 'RuntimeError',
      error_message: 'something broke!',
      error_backtrace: anything()
    })
    checker = LoginChecker.new(pals.healey_vivian_teacher, time_now: pals.time_now)
    checker.alert_if_suspicious

    expect { checker.send(:with_isolation) { raise 'something broke!' } }.not_to raise_error
  end

  it '#user_facing_email_text works' do
    checker = LoginChecker.new(pals.healey_vivian_teacher, time_now: pals.time_now)
    expect(checker.send(:user_facing_email_text, 'foo-warning-id')).to eq [
      "Your localhost-studentinsights account was just signed into.  You're getting this email to make sure that it was you.",
      "If this was you, there's nothing else you need to do.",
      "If this wasn't you, your account may have been compromised.  Email security@studentinsights.org and the Localhost Public Schools IT administrator immediately.  They'll take it from there to investigate and protect the students and families in Localhost Public Schools.",
      '',
      "Security alert sent from localhost-studentinsights at 2018-03-13 11:03:00 UTC."
    ].join("\n\n")
  end

  describe '#alert_if_suspicious' do
    it 'calls send_email_to_user! and it makes an HTTP request to Mailgun' do
      LoginActivity.create!({
        user_id: pals.healey_vivian_teacher.id,
        created_at: pals.time_now - 2.years
      })

      allow(Net::HTTP).to receive(:post_form)
      expect(Net::HTTP).to receive(:post_form).once.with(URI.parse('https://api:fake-mailgun-api-key@api.mailgun.net/v3/fake-mailgun-domain/messages'), {
        from: 'Student Insights <security@studentinsights.org>',
        to: 'vivian@demo.studentinsights.org',
        bcc: 'security@studentinsights.org',
        subject: 'Security alert for localhost-studentinsights',
        html: anything()
      })
      checker = LoginChecker.new(pals.healey_vivian_teacher, time_now: pals.time_now)
      checker.alert_if_suspicious
    end
  end
end
