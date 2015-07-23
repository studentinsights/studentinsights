FactoryGirl.define do
  sequence(:state_id) { |n| "#{n}000" }
end

FactoryGirl.define do

  factory :student do
    state_id
    association :homeroom
    factory :student_who_registered_in_2013_2014 do
      registration_date Date.new(2013, 8, 1)
    end
    factory :second_grade_student do
      grade "2"
    end
    factory :pre_k_student do
      grade "PK"
    end
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
      program_assigned "Sp Ed"
      sped_placement "Full Inclusion"
    end
    factory :limited_english_student do
      limited_english_proficiency "Limited"
    end
    factory :student_with_mcas_result do
      grade "5"
      after(:create) do |student|
        create(:mcas_result,
          student_id: student.id
        )
      end
    end

    # Test reading warning level

    factory :student_behind_in_reading do
      grade "5"
      after(:create) do |student|
        create(:star_result,
          student_id: student.id,
          instructional_reading_level: 3.5
        )
      end
    end

    factory :student_ahead_in_reading do
      grade "5"
      after(:create) do |student|
        create(:star_result,
          student_id: student.id,
          instructional_reading_level: 6.5
        )
      end
    end

    # Test attendance event sorting

    factory :student_with_attendance_event do
      registration_date Date.new(2014, 8, 1)
      after(:create) do |student|
        create(:attendance_event,
          student_id: student.id,
          absence: true,
          event_date: Time.new(2015, 1, 1)
        )
      end
    end

    # Test discipline incident sorting

    factory :student_with_discipline_incident do
      registration_date Date.new(2014, 8, 1)
      after(:create) do |student|
        create(:discipline_incident,
          student_id: student.id,
          event_date: Time.new(2015, 1, 1)
        )
      end
    end
  end
end
