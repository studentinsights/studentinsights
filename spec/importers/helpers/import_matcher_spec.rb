require 'rails_helper'

RSpec.describe ImportMatcher do
  def make_log
    LogHelper::FakeLog.new
  end

  describe '#parse_sheets_est_timestamp' do
    it 'works when EST (+5)' do
      Timecop.freeze(Time.parse('2019-01-30 12:22:02 -0400')) do
        form_timestamp = ImportMatcher.new.parse_sheets_est_timestamp('1/29/2019 9:01:24')
        expect(form_timestamp).to eq(Time.parse('2019-01-29T14:01:24.000Z'))
      end
    end

    it 'works when EDT (+4)' do
      Timecop.freeze(Time.parse('2018-07-13 12:22:02 -0400')) do
        form_timestamp = ImportMatcher.new.parse_sheets_est_timestamp('1/29/2019 9:01:24')
        expect(form_timestamp).to eq(Time.parse('2019-01-29T13:01:24.000Z'))
      end
    end
  end
end
