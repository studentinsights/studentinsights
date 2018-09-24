require 'rails_helper'

RSpec.describe StudentsSpreadsheet do
  context 'with generated students' do
    let!(:pals) { TestPals.create! }
    let!(:school) { School.find_by_name('Arthur D Healey') }
    let!(:educator) { FactoryBot.create(:educator, :admin, school: school) }
    let!(:homeroom) { Homeroom.create(name: 'HEA 300', grade: '3', school: school) }
    before do
      # the test data is not deterministic (setting a seed in srand only worked on
      # a single-file test run), so we only test for the output shape
      3.times { FakeStudent.create!(school, homeroom) }
      Student.update_recent_student_assessments
    end

    describe '#csv_string' do
      it 'generates a CSV with the expected number of lines' do
        csv_string = StudentsSpreadsheet.new.csv_string(school.students, school)
        expect(csv_string.split("\n").size).to eq(1 + school.students.size)
      end
    end

    describe '#flat_row_hash' do
      it 'creates expected fields' do
        flat_row_hash = StudentsSpreadsheet.new.send(:flat_row_hash, school.students.first, ServiceType.all, school)
        expect(flat_row_hash.keys).to match_array([
           'id',
           'grade',
           'free_reduced_lunch',
           'homeroom_id',
           'first_name',
           'last_name',
           'state_id',
           'home_language',
           'school_id',
           'registration_date',
           'local_id',
           'program_assigned',
           'sped_placement',
           'disability',
           'sped_level_of_need',
           'plan_504',
           'limited_english_proficiency',
           'most_recent_mcas_math_growth',
           'most_recent_mcas_ela_growth',
           'most_recent_mcas_math_performance',
           'most_recent_mcas_ela_performance',
           'most_recent_mcas_math_scaled',
           'most_recent_mcas_ela_scaled',
           'most_recent_star_reading_percentile',
           'most_recent_star_math_percentile',
           'enrollment_status',
           'date_of_birth',
           'gender',
           'discipline_incidents_count',
           'absences_count',
           'tardies_count',
           'homeroom_name',
           'primary_email',
           'primary_phone',
           'Attendance Officer (active_service_date_started)',
           'Attendance Contract (active_service_date_started)',
           'Behavior Contract (active_service_date_started)',
           'Community Schools (active_service_date_started)',
           'Counseling, in-house (active_service_date_started)',
           'Counseling, outside (active_service_date_started)',
           'Reading intervention (active_service_date_started)',
           'Math intervention (active_service_date_started)',
           'Afterschool Tutoring (active_service_date_started)',
           'SomerSession (active_service_date_started)',
           'Summer Program for English Language Learners (active_service_date_started)',
           'Freedom School (active_service_date_started)',
           'Boston Breakthrough (active_service_date_started)',
           'Calculus Project (active_service_date_started)',
           'Focused Math Intervention (active_service_date_started)',
           'Summer Explore (active_service_date_started)',

           'BBST Meeting (last_event_note_recorded_at)',
           'SST Meeting (last_event_note_recorded_at)',
           'MTSS Meeting (last_event_note_recorded_at)',
           '9th Grade Experience (last_event_note_recorded_at)',
           'Parent conversation (last_event_note_recorded_at)',
           'Something else (last_event_note_recorded_at)',
           'X-Block (active_service_date_started)',
           '10th Grade Experience (last_event_note_recorded_at)',
           'NEST (last_event_note_recorded_at)',
           'STAT Meeting (last_event_note_recorded_at)'
         ].sort
        )
      end
    end
  end
end
