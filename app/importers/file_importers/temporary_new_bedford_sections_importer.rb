# Patched to work for New Bedford transition file format; temporary class that
# subclasses private methods in other importers, so the approach is brittle but
# makes sense for a week or two transition period, when we can remove this after
# district folks update their formats upstream.
class TemporaryNewBedfordSectionsImporter
  def self.data_flow
    DataFlow.new({
      importer: self.name,
      source: DataFlow::SOURCE_SIS_SFTP_CSV,
      frequency: DataFlow::FREQUENCY_DAILY,
      options: [
        DataFlow::OPTION_SCHOOL_SCOPE
      ],
      merge: DataFlow::MERGE_UPDATE_IGNORE_UNMARKED, # more complicated, as this wraps multiple importers
      touches: [
        Section.name,
        Course.name,
        StudentSectionAssignment.name,
        EducatorSectionAssignment.name,
      ],
      description: 'Manual importer for transitioning to different section format in New Bedford.  Wraps other importers.'
    })
  end

  def initialize(options:)
    @options = options
    @merged_remote_file_name = @options.fetch(:merged_remote_file_name, nil)
    raise 'missing merged_remote_file_name' if @merged_remote_file_name.nil?
  end

  # This subclasses private methods, and is generally not a stable solution; this is a transition
  # approach for the next week or two while district folks update export formats.
  def import
    file_text = download_file_text()

    courses_and_sections_importer(file_text).import
    student_section_assignments_importer(file_text).import
    educator_section_assignments_importer(file_text).import
    nil
  end

  private
  def download_file_text
    File.read(SftpClient.for_x2.download_file(@merged_remote_file_name))
  end

  def courses_and_sections_importer(file_text)
    PatchedCoursesSectionsImporter.new(options: @options.merge(file_text: file_text))
  end

  def student_section_assignments_importer(file_text)
    PatchedStudentSectionAssignmentsImporter.new(options: @options.merge(file_text: file_text))
  end

  def educator_section_assignments_importer(file_text)
    PatchedEducatorSectionAssignmentsImporter.new(options: @options.merge(file_text: file_text))
  end

  class PatchedCoursesSectionsImporter < CoursesSectionsImporter
    def initialize(options:)
      @file_text = options.fetch(:file_text, '')
      super(options: options)
    end

    def remote_file_name
      'patched'
    end

    def download_csv
      rows = []
      StreamingCsvTransformer.from_text(@log, @file_text, csv_options: {}).each_with_index do |row, index|
        rows << row.to_h.merge({
          section_number: row[:course_view],
          term_local_id: row[:term_view],
          district_school_year: 2020,
          section_schedule: row[:schedule_display],
          section_room_number: row[:room_view]
        })
      end
      rows
    end
  end

  class PatchedEducatorSectionAssignmentsImporter < EducatorSectionAssignmentsImporter
    def initialize(options:)
      @file_text = options.fetch(:file_text, '')
      super(options: options)
    end

    def remote_file_name
      'patched'
    end

    def download_csv
      rows = []
      StreamingCsvTransformer.from_text(@log, @file_text, csv_options: {}).each_with_index do |row, index|
        educator_login_name = Educator.find_by_local_id(row[:staff_local_id]).try(:login_name)
        if educator_login_name.nil?
          @log.puts(' educator_login_name.nil? ')
          next
        end
        rows << row.to_h.merge({
          login_name: educator_login_name,
          section_number: row[:course_view],
          term_local_id: row[:term_view],
          district_school_year: 2020
        })
      end
      rows
    end
  end

  class PatchedStudentSectionAssignmentsImporter < StudentSectionAssignmentsImporter
    def initialize(options:)
      @file_text = options.fetch(:file_text, '')
      super(options: options)
    end

    def remote_file_name
      'patched'
    end

    def download_csv
      rows = []
      StreamingCsvTransformer.from_text(@log, @file_text, csv_options: {}).each_with_index do |row, index|
        rows << row.to_h.merge({
          section_number: row[:course_view],
          term_local_id: row[:term_view],
          district_school_year: 2020
        })
      end
      rows
    end
  end
end
