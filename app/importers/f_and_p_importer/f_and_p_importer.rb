# Used on the console to import data about F&P assessments.
#
# Usage:
# file_text = <<EOD
# ...
# EOD
# benchmark_date = Date.parse('2018/12/19')
# educator = Educator.find_by_login_name('...')
# output = FAndPImporter.new(benchmark_date, educator.id).import(file_text);nil
class FAndPImporter
  def initialize(benchmark_date, educator_id, options = {})
    @benchmark_date = benchmark_date
    @educator_id = educator_id
    @log = options.fetch(:log, Rails.env.test? ? LogHelper::Redirect.instance.file : STDOUT)
    @matcher = options.fetch(:matcher, ImportMatcher.new)
  end

  def import(file_text, options = {})
    dry_run = options.fetch(:dry_run, false)

    # parse
    rows = []
    StreamingCsvTransformer.from_text(@log, file_text).each_with_index do |row, index|
      maybe_row = maybe_parse_row(row.to_h, index)
      next if maybe_row.nil?
      rows << maybe_row
      @matcher.count_valid_row
    end
    log "matcher#stats: #{@matcher.stats}"

    # allow dry run with no impact on db
    return rows if dry_run

    # write to database
    f_and_ps = nil
    FAndPAssessment.transaction do
      FAndPAssessment.where(benchmark_date: @benchmark_date).destroy_all
      f_and_ps = rows.map {|row| FAndPAssessment.create!(row) }
    end
    f_and_ps
  end

  private
  def maybe_parse_row(row, index)
    student_id = @matcher.find_student_id(row['LASID'])
    return nil if student_id.nil?

    {
      student_id: student_id,
      benchmark_date: @benchmark_date,
      instructional_level: row['F&P Instructional Level'],
      f_and_p_code: row['F&P Code'],
      uploaded_by_educator_id: @educator_id
    }
  end

  def log(msg)
    text = if msg.class == String then msg else JSON.pretty_generate(msg) end
    @log.puts "FandPImporter: #{text}"
  end
end
