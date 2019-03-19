require 'spec_helper'

RSpec.describe LoginChecker do
  let!(:pals) { TestPals.create! }

  it '#warn_if_suspicious reports to Rollbar on :first_login_after_year' do
    LoginActivity.create!({
      user_id: pals.healey_vivian_teacher.id,
      created_at: pals.time_now - 2.years
    })

    allow(Rollbar).to receive(:warn)
    expect(Rollbar).to receive(:warn).once.with('LoginChecker#warn_if_suspicious', flags: [:first_login_after_year])
    checker = LoginChecker.new(pals.healey_vivian_teacher, time_now: pals.time_now)
    expect(checker.warn_if_suspicious).to eq [:first_login_after_year]
  end

  it '#warn_if_suspicious reports to Rollbar on :first_login_month_after_creation' do
    pals.healey_vivian_teacher.update!(created_at: pals.time_now - 32.days)

    allow(Rollbar).to receive(:warn)
    expect(Rollbar).to receive(:warn).once.with('LoginChecker#warn_if_suspicious', flags: [:first_login_month_after_creation])
    checker = LoginChecker.new(pals.healey_vivian_teacher, time_now: pals.time_now)
    expect(checker.warn_if_suspicious).to eq [:first_login_month_after_creation]
  end
end
