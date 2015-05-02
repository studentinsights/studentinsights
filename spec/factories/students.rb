FactoryGirl.define do
  sequence(:state_id) { |n| "#{n}000" }
end

FactoryGirl.define do

  factory :student do
      state_id

    factory :student_we_want_to_update do       # Test importing data from X2, STAR
      state_id "10"                             # State ID matches fixture
      home_language "English"
    end
    factory :student_with_homeroom do
      association :homeroom, name: "601"
    end
    factory :student_with_full_name do
      first_name Faker::Name.first_name
      last_name Faker::Name.last_name
    end
    factory :sped_student do
      sped true
    end
    factory :non_sped_student do
      sped false
    end
    factory :lep_student do
      limited_english_proficient true
    end
    factory :non_lep_student do
      limited_english_proficient false
    end

    # Test sorting students by risk level 

    factory :high_risk_student do
      state_id
      after(:create) do |student|
        create(:mcas_result_low, student_id: student.id)
      end
    end
    factory :medium_risk_student do
      state_id
      after(:create) do |student|
        create(:mcas_result_needs_improvement, student_id: student.id)
      end
    end
    factory :low_risk_student do
      state_id
      after(:create) do |student|
        create(:mcas_result_high, student_id: student.id)
      end
    end

    # Test assigning students to attendance results

    factory :student_without_attendance_result do
      state_id
    end
    factory :student_for_aggregating_attendance do
      state_id
    end
    factory :another_student_for_aggregating_attendance do
      state_id
    end
    factory :student_with_attendance_result do      # Test importing attendance data from X2
      state_id 'student_with_attendance_result'     # State ID matches FAKE_PARSED_ATTENDANCE_RESULT
      after(:create) do |student|
        create(:attendance_result,
          student_id: student.id,
          school_year: "2014-2015"
        )
      end
    end
  end
end
