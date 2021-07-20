class PerfTestEnforcer
  def initialize(options = {})
    @log = options.fetch(:log, STDOUT)
  end

  def check_percentiles(options = {})
    percentage = options.fetch(:percentage, 0.05)
    test_results = run_all_tests(percentage)
    test_results.each do |key, result|
      median = result[0]
      p95 = result[1]
      log("  Perfomance check for #{key}. Median: #{median}, P95: #{p95}  ")
      if median > 7000 || p95 > 25000
        Rollbar.warn("High response time in #{key}. Median: #{median}, P95: #{p95}")
      end
    end
  end

  def run_all_tests(percentage)
    perf_tester = PerfTester.new(log: @log)
    all_checks = {}
    all_checks["absences_dashboard"] = perf_tester.absences_dashboard(percentage)["all_for_educator"]
    all_checks["levels_shs"] = perf_tester.levels_shs(percentage)["all_for_educator"]
    all_checks["labels"] = perf_tester.labels(percentage)["all_for_educator"]
    all_checks["authorized"] = perf_tester.authorized(percentage)["all_for_educator"]
    all_checks["navbar_links"] = perf_tester.navbar_links(percentage)["all_for_educator"]
    all_checks["authorized_homerooms"] = perf_tester.authorized_homerooms(percentage)["all_for_educator"]
    all_checks["my_students"] = perf_tester.my_students(percentage)["all_for_educator"]
    all_checks["is_relevant_for_educator"] = perf_tester.is_relevant_for_educator?(percentage)["all_for_educator"]
    all_checks["high_absences"] = perf_tester.high_absences(percentage)["all_for_educator"]
    all_checks["low_grades"] = perf_tester.low_grades(percentage)["all_for_educator"]
    all_checks["section_authorization_pattern"] = perf_tester.section_authorization_pattern(percentage)["all_for_educator"]
    all_checks["feed"] = perf_tester.feed(percentage)["all_for_educator"]
    all_checks
  end

  private
  def log(msg = '')
    @log.puts msg
  end
end
