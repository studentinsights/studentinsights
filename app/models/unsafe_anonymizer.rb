require 'digest'
require 'csv'

# Serializes to JSON with personally-identifiable information stripped out.
#
# Intended to be used for sharing with folks who are already working on
# the project and have signed a data sharing agreement, so that they
# can do analysis without granting access to production systems or
# personally-identifiable information.
#
# Keep in mind that if the numbers of students is small, when joined with
# with local knowledge that people in the school or community may have,
# people may be able to make inferences about this data set (eg., if there
# is only one student who is of a particular race/gender combination in a
# particular class).
#
# In other words, this is still highly sensitive information should never
# be shared with folks who don't have a direct need to access it for the
# project, and should still be transmitted securely.  If you're looking for
# a way to share data for development purposes, use the seed tasks instead.
# If you're looking for how to make the seed data more realistic, work towards
# improving the seed tasks rather than working from any data generated with
# this class.
#
# Example:
#
#   anon = UnsafeAnonymizer.new
#   students = Student.all.map {|student| anon.student(student) };nil
#   schools = School.all.map {|school| anon.school(school) };nil
#   absences = Absence.all.map {|absence| anon.absence(absence) };nil
#   service_types = anon.all_service_types;nil
#   student_for_absence_dashboard = Student.all.map {|student| anon.student_for_absence_dashboard(student) };nil
#
#
#   # only particular services
#   relevant_service_type_ids = [509, 510, 511, 512, 513]
#   relevant_services = Service.all.select do |service|
#     relevant_service_type_ids.include?(service.service_type_id)
#   end;nil
#   services = relevant_services.map {|service| anon.service(service) };nil
#
#   # only particular assessments
#   relevant_student_assessments = StudentAssessment.by_family('STAR');nil
#   student_assessments = relevant_student_assessments.map {|student_assessment| anon.star_student_assessment(student_assessment) };nil
#
#   puts anon.to_csv(students)
#   puts anon.to_csv(schools)
#   puts anon.to_csv(services)
#   puts anon.to_csv(service_types)
#   puts anon.to_csv(student_assessments)
#   puts anon.to_csv(absences)
#   puts anon.to_csv(student_for_absence_dashboard)
#
class UnsafeAnonymizer
  def student(student)
    whitelisted_keys = [
      :grade,
      :hispanic_latino,
      :race,
      :free_reduced_lunch,
      :home_language,
      :program_assigned,
      :sped_placement,
      :disability,
      :sped_level_of_need,
      :plan_504,
      :limited_english_proficiency,
      :enrollment_status,
      :risk_level,
      :gender
    ]
    hashed_keys = [
      :id,
      :school_id
    ]
    serialize(student, whitelisted_keys, hashed_keys)
  end

  def student_for_absence_dashboard(student)
    whitelisted_keys = []

    hashed_keys = [:id, :homeroom_id]

    serialize(student, whitelisted_keys, hashed_keys)
  end

  def absence(absence)
    whitelisted_keys = [:occurred_at]

    hashed_keys = [:student_id]

    serialize(absence, whitelisted_keys, hashed_keys)
  end

  def school(school)
    serialize(school, [:slug], [:id])
  end

  # Note that `recorded_at` means the date it ended
  def service(service)
    {
      id: sha(service.id),
      student_id: sha(service.student_id),
      service_type_id: sha(service.service_type_id),
      date_started: service.date_started,
      end_date: service.end_date
    }
  end

  def star_student_assessment(student_assessment)
    {
      id: sha(student_assessment.id),
      student_id: sha(student_assessment.student_id),
      family: student_assessment.family,
      subject: student_assessment.subject,
      date_taken: student_assessment.date_taken,
      percentile_rank: student_assessment.percentile_rank,
      instructional_reading_level: student_assessment.instructional_reading_level,
      grade_equivalent: student_assessment.grade_equivalent
    }
  end

  def all_service_types
    ServiceType.all.map do |service_type|
      {
        id: sha(service_type.id),
        name: service_type.name
      }
    end
  end

  def to_csv(hashes)
    return '' if hashes.size == 0
    CSV.generate do |csv|
      csv << hashes.first.keys
      hashes.each {|hash| csv << hash.values }
    end
  end

  private
  def serialize(object, whitelisted_keys, hashed_keys)
    whitelisted_strs = whitelisted_keys.map(&:to_s)
    hashed_strs = hashed_keys.map(&:to_s)

    attrs = object.as_json
    output_hash = {}
    hashed_strs.each {|key| output_hash[key] = sha(attrs[key])}
    whitelisted_strs.each {|key| output_hash[key] = attrs[key] }
    output_hash
  end

  def sha(value)
    return nil if value.nil?
    Digest::SHA256.hexdigest(value.to_s)
  end
end
