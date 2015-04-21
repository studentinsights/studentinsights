FactoryGirl.define do
  
  factory :student do
    factory :student_we_want_to_update do         # Test updating from X2
      state_identifier "10"
      home_language "English"
    end
    factory :student_with_homeroom do             # Test setting homeroom from X2
      association :homeroom, name: "601"
    end
    factory :student_with_full_name do            # Test setting name from X2
      first_name Faker::Name.first_name
      last_name Faker::Name.last_name
    end
    factory :sped_student do                      # Test setting sped from X2
      sped true
    end
    factory :non_sped_student do
      sped false
    end
    factory :lep_student do                       # Test setting limited english from X2
      limited_english_proficient true
    end
    factory :non_lep_student do
      limited_english_proficient false
    end
    factory :student_with_attendance_result do    # Test importing attendance data from X2
      state_identifier "123updateme"              # State ID atches FAKE_PARSED_ATTENDANCE_RESULT from FakeX2Attendance
      after(:create) do |student|
        create(:attendance_result,
          student_id: student.id,
          school_year: "2014-2015"
        )
      end
    end
    factory :student_without_attendance_result do
      state_identifier "123updateme"
    end
    factory :student_for_aggregating_attendance do
      state_identifier "200"
    end
    factory :another_student_for_aggregating_attendance do
      state_identifier "300"
    end
  end
end
