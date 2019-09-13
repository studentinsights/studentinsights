require 'rails_helper'

RSpec.describe BedfordTeacherTransitionProcessor do
  let!(:pals) { TestPals.create! }

  def create_processor(options = {})
    log = LogHelper::FakeLog.new
    importer = BedfordTeacherTransitionProcessor.new(pals.uri, options: {
      log: log,
      time_now: pals.time_now
    }.merge(options))
    importer
  end

  it 'logs deprecation warning' do
    expect(Rollbar).to receive(:warn).once.with('deprecation-warning, see `FormToNotesProcessor` and `teacher_forms` format')
    create_processor()
  end

  it 'raises on #create!' do
    processor = create_processor()
    expect { processor.create!('') }.to raise_error(RuntimeError, 'Not implemented, use #dry_run manually instead.')
  end
end
