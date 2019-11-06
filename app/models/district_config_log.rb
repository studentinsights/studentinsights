# Stores configuration that folks in the district ideally would manage on their
# own.  In other words, this shouldn't be config that handles internals about
# how Student Insights is different across districts, but "district maintenance"
# that district IT and district project leads could manage.
class DistrictConfigLog < ApplicationRecord
  SFTP_FILENAMES = 'sftp_filenames'

  validates :key, inclusion: { in: [SFTP_FILENAMES] }

  def self.latest_json(key, fallback = nil)
    where(key: key).order(created_at: :desc).limit(1).try(:json) || fallback
  end

  # These aren't entirely static, but this seeds with
  # values that are useful for dev and test.
  def self.seed_for_development_and_test!
    raise 'only for dev/test!' unless (Rails.env.development? || Rails.env.test?)

    DistrictConfigLog.create!({
      key: DistrictConfigLog::SFTP_FILENAMES,
      json: {
        "FILENAME_FOR_EDUCATORS_IMPORT": "/data/insights-dev-or-test/educators_export.csv",
        "FILENAME_FOR_STUDENTS_IMPORT": "/data/insights-dev-or-test/students_export.csv",
        "FILENAME_FOR_BEHAVIOR_IMPORT": "/data/insights-dev-or-test/behavior_export.csv",
        "FILENAME_FOR_ASSESSMENT_IMPORT": "/data/insights-dev-or-test/assessment_export.csv",
        "FILENAME_FOR_ATTENDANCE_IMPORT": "/data/insights-dev-or-test/attendance_export.csv",
        "FILENAME_FOR_STUDENT_AVERAGES_IMPORT": "/data/insights-dev-or-test/student_averages_export.csv",
        "FILENAME_FOR_COURSE_SECTION_IMPORT": "/data/insights-dev-or-test/courses_sections_export.csv",
        "FILENAME_FOR_STUDENTS_SECTION_ASSIGNMENT_IMPORT": "/data/insights-dev-or-test/student_section_assignment_export.csv",
        "FILENAME_FOR_EDUCATOR_SECTION_ASSIGNMENT_IMPORT": "/data/insights-dev-or-test/educator_section_assignment_export.csv",
        "FILENAME_FOR_ED_PLAN_IMPORT": "/data/insights-dev-or-test/student_ed_plan_export.csv",
        "FILENAME_FOR_ED_PLAN_ACCOMMODATIONS_IMPORT": "/data/insights-dev-or-test/student_accommodations_export.csv",

        "FILENAME_FOR_PHOTOS_ZIP": "/data/insights-dev-or-test/photos.zip",

        "FILENAMES_FOR_IEP_PDF_ZIPS_ORDERED_OLDEST_TO_NEWEST": [
          "/data/insights-dev-or-test/student-documents-6.zip",
          "/data/insights-dev-or-test/student-documents-5.zip",
          "/data/insights-dev-or-test/student-documents-4.zip",
          "/data/insights-dev-or-test/student-documents-3.zip",
          "/data/insights-dev-or-test/student-documents-2.zip",
          "/data/insights-dev-or-test/student-documents-1.zip"
        ]
      }
    })
  end
end
