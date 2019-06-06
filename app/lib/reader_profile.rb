class ReaderProfile
  def initialize(student, options = {})
    @student = student
    @time_now = options.fetch(:time_now, Time.now)
    @cards_limit = options.fetch(:cards_limit, 100)
    @s3 = options.fetch(:s3, MockAwsS3.create_real_or_mock)
  end

  def reader_profile_json
    json_by_student_id = JSON.parse(IO.read('/Users/krobinson/Desktop/DANGER2/2019-04-02-reading-kindergarten/reader_profiles_by_student_id2.json'))
    student_ids = json_by_student_id.keys
    # student_id = student_ids.sample
    # student_id = '5531' # 1st
    # student_id = '5684' # 1st
    # student_id = '5682' # 1st
    # student_id = '3376' # 1st
    student_id = '5379' # 1st
    return json_by_student_id[student_id].merge({
      iep_contents: JSON.parse(IO.read('/Users/krobinson/Desktop/DANGER2/2019-04-02-reading-kindergarten/pages.json')).merge({
        id: 77
      })
    })



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
      iep_contents: iep_json,
      feed_cards: feed_cards,
      services: services_json
    }
  end

  private
  def iep_json
    iep_document = @student.latest_iep_document
    return nil if iep_document.nil?

    pdf_bytes = IepStorer.unsafe_read_bytes_from_s3(@s3, iep_document)
    pdf_io = StringIO.new(pdf_bytes)
    reader = PDF::Reader.new(pdf_io)
    pages_json = reader.pages.map do |page|
      {
        number: page.number,
        text: page.text.strip # clean up for lunr searching, which is confused by leading spaces
      }
    end

    {
      iep_document: iep_document.as_json,
      pretty_filename_for_download: iep_document.pretty_filename_for_download,
      pages: pages_json
    }
  end
end
