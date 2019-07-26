# typed: false
require 'rails_helper'

RSpec.describe WideStudentsExporter do
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
        csv_string = WideStudentsExporter.new(pals.uri).csv_string(school.students)
        expect(csv_string.split("\n").size).to eq(1 + school.students.size)
      end
    end

    describe '#flat_row_hash' do
      it 'creates expected fields with all options' do
        exporter = WideStudentsExporter.new(pals.uri, {
          include_additional_fields: true,
          include_services: true,
          include_event_notes: true
        })
        flat_row_hash = exporter.send(:flat_row_hash, school.students.first)
        expect(flat_row_hash.keys).to contain_exactly(*[
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
           'counselor',
           'hispanic_latino',
           'house',
           'race',
           'sped_liaison',
           'student_address',
           'program_assigned',
           'sped_placement',
           'disability',
           'sped_level_of_need',
           'plan_504',
           'limited_english_proficiency',
           'ell_entry_date',
           'ell_transition_date',
           'most_recent_mcas_math_growth',
           'most_recent_mcas_ela_growth',
           'most_recent_mcas_math_performance',
           'most_recent_mcas_ela_performance',
           'most_recent_mcas_math_scaled',
           'most_recent_mcas_ela_scaled',
           'most_recent_star_reading_percentile',
           'most_recent_star_math_percentile',
           'enrollment_status',
           'missing_from_last_export',
           'date_of_birth',
           'gender',
           'primary_email',
           'primary_phone',

           'homeroom_name',
           'discipline_incidents_count',
           'absences_count',
           'tardies_count',

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
           'Counselor Meeting (last_event_note_recorded_at)',
           'STAT Meeting (last_event_note_recorded_at)',
           'CAT Meeting (last_event_note_recorded_at)',
           '504 Meeting (last_event_note_recorded_at)',
           'SPED Meeting (last_event_note_recorded_at)'
         ].sort
        )
      end

      it 'limits default fields' do
        exporter = WideStudentsExporter.new(pals.uri)
        flat_row_hash = exporter.send(:flat_row_hash, school.students.first)
        expect(flat_row_hash.keys).to contain_exactly(*[
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
          'counselor',
          'hispanic_latino',
          'house',
          'race',
          'sped_liaison',
          'student_address',
          'program_assigned',
          'sped_placement',
          'disability',
          'sped_level_of_need',
          'plan_504',
          'limited_english_proficiency',
          'ell_entry_date',
          'ell_transition_date',
          'most_recent_mcas_math_growth',
          'most_recent_mcas_ela_growth',
          'most_recent_mcas_math_performance',
          'most_recent_mcas_ela_performance',
          'most_recent_mcas_math_scaled',
          'most_recent_mcas_ela_scaled',
          'most_recent_star_reading_percentile',
          'most_recent_star_math_percentile',
          'enrollment_status',
          'missing_from_last_export',
          'date_of_birth',
          'gender',
          'primary_email',
          'primary_phone'
        ])
      end
    end
  end
end
