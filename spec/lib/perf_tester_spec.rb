require 'spec_helper'

# These are just smoke tests verifying that the methods still
# can be called and don't regress.  It is not making assertion about
# actual performance.
RSpec.describe PerfTester do
  let!(:pals) { TestPals.create! }

  def create_perf_tester(options = {})
    log = LogHelper::FakeLog.new
    perf_tester = PerfTester.new(log: log)
    [perf_tester, log]
  end

  def expect_smoke_test_passes_for(method_symbol)
    tester, log = create_perf_tester()
    expect { tester.send(method_symbol, 1.0) }.not_to raise_error
    expect(log.output).to include('Getting test set...')
    expect(log.output).to include('Starting test run...')
    expect(log.output).to include('median')
    expect(log.output).to include('p95')
    expect(log.output).to include('Done.')
  end

  it 'measures #absences_dashboard' do
    expect_smoke_test_passes_for(:absences_dashboard)
  end

  it 'measures #levels_shs' do
    expect_smoke_test_passes_for(:levels_shs)
  end

  it 'measures #labels' do
    expect_smoke_test_passes_for(:labels)
  end

  it 'measures #authorized' do
    expect_smoke_test_passes_for(:authorized)
  end

  it 'measures #navbar_links' do
    expect_smoke_test_passes_for(:navbar_links)
  end

  it 'measures #authorized_homerooms' do
    expect_smoke_test_passes_for(:authorized_homerooms)
  end

  it 'measures #authorized_homerooms_DEPRECATED' do
    expect_smoke_test_passes_for(:authorized_homerooms_DEPRECATED)
  end

  it 'measures #my_students' do
    expect_smoke_test_passes_for(:my_students)
  end

  it 'measures #is_relevant_for_educator?' do
    expect_smoke_test_passes_for(:is_relevant_for_educator?)
  end

  it 'measures #high_absences' do
    expect_smoke_test_passes_for(:high_absences)
  end

  it 'measures #low_grades' do
    expect_smoke_test_passes_for(:low_grades)
  end

  it 'measures #section_authorization_pattern' do
    expect_smoke_test_passes_for(:section_authorization_pattern)
  end

  it 'measures #feed' do
    expect_smoke_test_passes_for(:feed)
  end
end
