require 'rails_helper'

RSpec.describe BedfordTeacherTransitionImporter do
  let!(:pals) { TestPals.create! }

  def create_importer_with_fetcher_mocked(options = {})
    log = LogHelper::FakeLog.new
    fetcher = GoogleSheetsFetcher.new
    importer = BedfordTeacherTransitionImporter.new(options: {
      log: log,
      fetcher: fetcher,
      time_now: pals.time_now
    }.merge(options))
    importer
  end

  it 'logs deprecation warning' do
    expect(Rollbar).to receive(:warn).once.with('deprecation-warning: move to `teacher_forms` template')
    create_importer_with_fetcher_mocked()
  end

  it 'raises on #import' do
    importer = create_importer_with_fetcher_mocked()
    expect { importer.import }.to raise_error(RuntimeError, 'This should be done manually, because of DataFlow::MERGE_CREATE_NAIVELY strategy.  Use #dry_run instead.')
  end
end
