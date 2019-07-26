# typed: true
class ReaderProfile
  def initialize(student, options = {})
    @student = student
    @time_now = options.fetch(:time_now, Time.now)
    @cards_limit = options.fetch(:cards_limit, 100)
    @s3 = options.fetch(:s3, MockAwsS3.create_real_or_mock)
  end

  def reader_profile_json
    benchmark_data_points = ReadingBenchmarkDataPoint.all.where(student_id: @student.id)
    feed_cards = Feed.new([@student]).all_cards(@time_now, @cards_limit)
    services_json = @student.services.as_json(include: {
      recorded_by_educator: {
        only: [:id, :email, :full_name]
      },
      discontinued_by_educator: {
        only: [:id, :email, :full_name]
      },
      service_type: {
        only: [:id, :name, :summer_program]
      }
    })

    {
      current_school_year: SchoolYear.to_school_year(@time_now),
      benchmark_data_points: benchmark_data_points.as_json,
      access: @student.access.as_json,
      iep_contents: iep_contents_json,
      feed_cards: feed_cards,
      services: services_json
    }
  end

  private
  def iep_contents_json
    iep_document = @student.latest_iep_document
    return nil if iep_document.nil?

    # fetch PDF and convert into raw text
    pdf_bytes = IepStorer.unsafe_read_bytes_from_s3(@s3, iep_document)
    pdf_io = StringIO.new(pdf_bytes)
    reader = PDF::Reader.new(pdf_io)
    raw_text = reader.pages.map {|page| page.text }.join("\n")

    # try to clean and parse that messy text
    parsed_json = IepTextParser.new(raw_text).parsed_json

    {
      iep_document: iep_document.as_json,
      pretty_filename_for_download: iep_document.pretty_filename_for_download,
      parsed: parsed_json
    }
  end
end
