require 'spec_helper'

RSpec.describe PerfTestEnforcer do
  describe "run all tests" do
    let!(:pals) { TestPals.create! }
    it "executes all listed checks" do
      all_tests = PerfTestEnforcer.new.run_all_tests(1.0)
      expect(all_tests.size).to eq 12
      expect(all_tests.all? { |x| x.size == 2 }).to eq true
    end
  end

  describe 'percentage thresholds' do
    it 'sends Rollbar alert when percentages are within acceptable ranges' do
      expect(Rollbar).not_to receive(:warn)
      tester = PerfTestEnforcer.new
      test_run_pass = {
        absences_dashboard: [100,1000],
        levels_shs: [100,1000],
        labels: [100,1000],
        authorized: [100,1000],
        navbar_links: [100,1000],
        authorized_homerooms: [100,1000],
        my_students: [100,1000],
        is_relevant_for_educator: [100,1000],
        high_absences: [100,1000],
        low_grades: [100,1000],
        section_authorization_pattern: [100,1000],
        feed: [100,1000],
      }
      tester.stub(:run_all_tests).and_return(test_run_pass)
      tester.check_percentiles
    end

    it 'sends Rollbar alert when only median response times are outside the range' do
      expect(Rollbar).to receive(:warn).with("High response time in absences_dashboard. Median: 8000, P95: 8000")
      tester = PerfTestEnforcer.new
      test_run_long_median = {
        absences_dashboard: [8000,8000],
        levels_shs: [100,1000],
        labels: [100,1000],
        authorized: [100,1000],
        navbar_links: [100,1000],
        authorized_homerooms: [100,1000],
        my_students: [100,1000],
        is_relevant_for_educator: [100,1000],
        high_absences: [100,1000],
        low_grades: [100,1000],
        section_authorization_pattern: [100,1000],
        feed: [100,1000],
      }
      tester.stub(:run_all_tests).and_return(test_run_long_median)
      tester.check_percentiles
    end

    it 'sends Rollbar alert when only p95 responses are outside the range' do
      expect(Rollbar).to receive(:warn).with("High response time in section_authorization_pattern. Median: 100, P95: 40000")
      tester = PerfTestEnforcer.new
      test_run_long_p95 = {
        absences_dashboard: [100,1000],
        levels_shs: [100,1000],
        labels: [100,1000],
        authorized: [100,1000],
        navbar_links: [100,1000],
        authorized_homerooms: [100,1000],
        my_students: [100,1000],
        is_relevant_for_educator: [100,1000],
        high_absences: [100,1000],
        low_grades: [100,1000],
        section_authorization_pattern: [100,40000],
        feed: [100,1000],
      }
      tester.stub(:run_all_tests).and_return(test_run_long_p95)
      tester.check_percentiles
    end

    it 'sends Rollbar alert when both responses are outside the range' do
      expect(Rollbar).to receive(:warn).with("High response time in my_students. Median: 8000, P95: 40000")
      tester = PerfTestEnforcer.new
      test_run_long = {
        absences_dashboard: [100,1000],
        levels_shs: [100,1000],
        labels: [100,1000],
        authorized: [100,1000],
        navbar_links: [100,1000],
        authorized_homerooms: [100,1000],
        my_students: [8000,40000],
        is_relevant_for_educator: [100,1000],
        high_absences: [100,1000],
        low_grades: [100,1000],
        section_authorization_pattern: [100,1000],
        feed: [100,1000],
      }
      tester.stub(:run_all_tests).and_return(test_run_long)
      tester.check_percentiles
    end
  end
end
