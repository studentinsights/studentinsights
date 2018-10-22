require 'rails_helper'

RSpec.describe PrecomputeStudentHashesJob do

  def create_job
    log = LogHelper::FakeLog.new
    PrecomputeStudentHashesJob.new(log)
  end

  describe '#school_overview_precompute_jobs' do
    let!(:pals) { TestPals.create! }

    it 'creates one job for TestPals as expected, with one job for each set of students in a school' do
      jobs = create_job.send(:school_overview_precompute_jobs)
      expect(jobs).to contain_exactly(*[
        {
          authorized_student_ids: [pals.healey_kindergarten_student.id]
        }, {
          authorized_student_ids: [pals.west_eighth_ryan.id]
        }, {
          authorized_student_ids: contain_exactly(*[
            pals.shs_freshman_mari.id,
            pals.shs_freshman_amir.id,
            pals.shs_senior_kylo.id
          ])
        }
      ])
    end
  end

  describe '#precompute_and_write_doc!' do
    let!(:pals) { TestPals.create! }

    it 'writes the expected document shape' do
      log = LogHelper::FakeLog.new
      job = PrecomputeStudentHashesJob.new(log)
      doc = job.send(:precompute_and_write_doc!, { authorized_student_ids: [pals.west_eighth_ryan.id] })

      expect(PrecomputedQueryDoc.all.size).to eq(1)
      expect(doc.as_json(only: [:key, :json, :authorized_students_digest])).to include({
        'key' => a_kind_of(String),
        'json' => a_kind_of(String),
        'authorized_students_digest' => a_kind_of(String)
      })
      student_hashes = JSON.parse(doc.json)['student_hashes']
      expect(student_hashes.size).to eq 1
      expect(student_hashes.first.keys).to contain_exactly(*[
        'id',
        'grade',
        'hispanic_latino',
        'race',
        'free_reduced_lunch',
        'created_at',
        'updated_at',
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
        'house',
        'counselor',
        'sped_liaison',
        'missing_from_last_export',
        'discipline_incidents_count',
        'absences_count',
        'tardies_count',
        'homeroom_name'
      ])
    end
  end

  describe 'integration test, from job to read path' do
    let!(:pals) { TestPals.create! }

    it 'works end-to-end for TestPals' do
      log = LogHelper::FakeLog.new
      job = PrecomputeStudentHashesJob.new(log)
      job.precompute_all!

      # check the shape for each school with students
      expect(PrecomputedQueryDoc.all.size).to eq(3)
      schools_with_students = School.all.select {|school| school.students.active.size > 0 }
      expect(schools_with_students.size).to eq 3
      schools_with_students.each do |school|
        student_ids = school.students.active.map(&:id)
        student_hashes = PrecomputedQueryDoc.latest_precomputed_student_hashes_for(student_ids)
        expect(student_hashes.first.keys).to contain_exactly(*[
          :id,
          :created_at,
          :updated_at,
          :grade,
          :hispanic_latino,
          :race,
          :free_reduced_lunch,
          :homeroom_id,
          :first_name,
          :last_name,
          :state_id,
          :home_language,
          :school_id,
          :registration_date,
          :local_id,
          :program_assigned,
          :sped_placement,
          :disability,
          :sped_level_of_need,
          :plan_504,
          :limited_english_proficiency,
          :most_recent_mcas_math_growth,
          :most_recent_mcas_ela_growth,
          :most_recent_mcas_math_performance,
          :most_recent_mcas_ela_performance,
          :most_recent_mcas_math_scaled,
          :most_recent_mcas_ela_scaled,
          :most_recent_star_reading_percentile,
          :most_recent_star_math_percentile,
          :enrollment_status,
          :date_of_birth,
          :gender,
          :house,
          :counselor,
          :sped_liaison,
          :missing_from_last_export,
          :discipline_incidents_count,
          :absences_count,
          :tardies_count,
          :homeroom_name
        ])

      end

      # check the actual data for one school
      healey_student_hashes = PrecomputedQueryDoc.latest_precomputed_student_hashes_for([pals.healey_kindergarten_student.id])
      expect(healey_student_hashes).to contain_exactly(*[
        include({
          id: pals.healey_kindergarten_student.id,
          grade: "KF",
          homeroom_id: pals.healey_kindergarten_student.homeroom_id,
          first_name: "Garfield",
          last_name: "Skywalker",
          state_id: "991111111",
          school_id: pals.healey.id,
          local_id: "111111111",
          enrollment_status: "Active",
          missing_from_last_export: false,
          discipline_incidents_count: 0,
          absences_count: 0,
          tardies_count: 0,
          homeroom_name: "HEA 003",
          registration_date: nil,
          home_language: nil,
          hispanic_latino: nil,
          race: nil,
          free_reduced_lunch: nil,
          program_assigned: nil,
          sped_placement: nil,
          disability: nil,
          sped_level_of_need: nil,
          plan_504: nil,
          limited_english_proficiency: nil,
          most_recent_mcas_math_growth: nil,
          most_recent_mcas_ela_growth: nil,
          most_recent_mcas_math_performance: nil,
          most_recent_mcas_ela_performance: nil,
          most_recent_mcas_math_scaled: nil,
          most_recent_mcas_ela_scaled: nil,
          most_recent_star_reading_percentile: nil,
          most_recent_star_math_percentile: nil,
          date_of_birth: nil,
          gender: nil,
          house: nil,
          counselor: nil,
          sped_liaison: nil
        })
      ])
    end
  end
end
