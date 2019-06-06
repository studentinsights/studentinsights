class ReaderProfile
  def initialize(student, options = {})
    @student = student
    @time_now = options.fetch(:time_now, Time.now)
    @cards_limit = options.fetch(:cards_limit, 100)
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
      benchmark_data_points: benchmark_data_points,
      access: @student.access,
      iep_contents: iep_json,
      feed_cards: feed_cards,
      services: services_json
    }
  end

  private
  def iep_json
    iep_document = @student.latest_iep_document
    return nil if iep_document.nil?

    pdf_bytes = IepStorer.unsafe_read_bytes_from_s3(s3, iep_document)
    reader = PDF::Reader.new(pdf_bytes)
    pages_json = reader.pages.map do |page|
      {
        number: page.number,
        text: page.text.strip # messes up lunr searching
      }
    end

    {
      iep_document: iep_document.as_json,
      pretty_filename_for_download: iep_document.pretty_filename_for_download,
      pages: pages_json
    }
  end
end
