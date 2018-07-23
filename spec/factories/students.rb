FactoryBot.define do

  sequence(:student_local_id) { |n| "#{n}000" }

  sequence(:valid_grade_level) { [ 'PK', 'KF', '1', '2', '3', '4', '5', '6', '7', '8' ].sample }

  factory :student do
    local_id { generate(:student_local_id) }
    first_name { FakeNames.deterministic_sample(FakeNames::FIRST_NAMES) }
    last_name { FakeNames.deterministic_sample(FakeNames::LAST_NAMES) }
    grade { generate(:valid_grade_level) }
    association :homeroom
    association :school
    enrollment_status "Active"

    trait :registered_last_year do
      registration_date Time.now - 1.year
    end

    trait :low_income do
      free_reduced_lunch "Free Lunch"
    end

    trait :with_service_and_event_note_and_intervention do
      after(:create) do |student|
        FactoryBot.create(:service, student: student)
        FactoryBot.create(:event_note, student: student)
        FactoryBot.create(:intervention, student: student)
      end
    end

    trait :with_mcas_math_advanced_assessment do
      after(:create) do |student|
        FactoryBot.create(:mcas_math_advanced_assessment, student: student)
      end
    end

    trait :with_mcas_math_score_240 do
      after(:create) do |student|
        FactoryBot.create(:mcas_math_student_assessment_score_240, student: student)
      end
    end

    trait :with_mcas_math_score_280 do
      after(:create) do |student|
        FactoryBot.create(:mcas_math_student_assessment_score_280, student: student)
      end
    end

    trait :with_mcas_ela_score_250 do
      after(:create) do |student|
        FactoryBot.create(:mcas_ela_student_assessment_score_250, student: student)
      end
    end

    trait :with_mcas_ela_score_290 do
      after(:create) do |student|
        FactoryBot.create(:mcas_ela_student_assessment_score_290, student: student)
      end
    end

    trait :with_three_recent_absences do
      after(:create) do |student|
        3.times do
          FactoryBot.create(:attendance_event, :absence, :recent, student: student)
        end
      end
    end

    trait :with_three_recent_tardies do
      after(:create) do |student|
        3.times do
          FactoryBot.create(:attendance_event, :tardy, :recent, student: student)
        end
      end
    end

    trait :with_recent_school_year do
      after(:create) do |student|
        FactoryBot.create(:student_school_year, student: student)
      end
    end

    factory :student_who_registered_in_2013_2014 do
      registration_date Date.new(2013, 8, 1)
    end
    factory :second_grade_student do
      grade "2"
    end
    factory :high_school_student do
      grade "11"
    end
    factory :pre_k_student do
      grade "PK"
    end
    factory :student_we_want_to_update do       # Test importing data from X2, STAR
      local_id "10"                             # State ID matches fixture
      home_language "English"
    end
    factory :student_with_homeroom do
      association :homeroom, name: "601"
    end
    factory :sped_student do
      program_assigned "Sp Ed"
      sped_placement "Full Inclusion"
    end
    factory :limited_english_student do
      limited_english_proficiency "Limited"
    end

    factory :student_with_registration_date do
      registration_date Date.new(2015, 1, 1)

      factory :student_with_mcas_assessment do
        grade '6'
        after(:create) do |student|
          FactoryBot.create(:mcas_assessment, student: student)
        end
      end

      factory :student_with_mcas_math_assessment do
        grade '6'
        after(:create) do |student|
          FactoryBot.create(:mcas_math_assessment, student: student)
        end
      end

      factory :student_with_mcas_ela_assessment do
        grade '6'
        after(:create) do |student|
          FactoryBot.create(:mcas_ela_assessment, student: student)
        end
      end

      factory :student_with_mcas_math_warning_assessment do
        grade '6'
        after(:create) do |student|
          FactoryBot.create(:mcas_math_warning_assessment, student: student)
        end
      end

      factory :student_with_mcas_math_advanced_and_star_math_warning_assessments do
        grade '6'
        after(:create) do |student|
          FactoryBot.create(:mcas_math_advanced_assessment, student: student)
          FactoryBot.create(:star_math_warning_assessment, student: student)
        end
      end

      factory :student_with_star_math_assessment do
        grade '6'
        after(:create) do |student|
          FactoryBot.create(:star_math_assessment, student: student)
        end
      end

      factory :student_with_star_math_and_star_reading_same_day do
        grade '6'
        after(:create) do |student|
          FactoryBot.create(:star_math_assessment, student: student)
          FactoryBot.create(:star_reading_assessment, student: student)
        end
      end

      factory :student_with_star_math_student_assessments_different_days do
        grade '6'
        after(:create) do |student|
          FactoryBot.create(:star_math_assessment, student: student)
          FactoryBot.create(:star_math_assessment_on_different_day, student: student)
        end
      end

      factory :student_with_star_assessment_between_30_85 do
        grade '6'
        after(:create) do |student|
          FactoryBot.create(:star_assessment_between_30_85, student: student)
        end
      end

      factory :student_with_dibels do
        after(:create) do |student|
          FactoryBot.create(:dibels_with_performance_level, student: student)
        end
      end

      factory :student_with_access do
        after(:create) do |student|
          FactoryBot.create(:access, student: student)
        end
      end

      # Test interventions
      factory :student_with_one_atp_intervention do
        after(:create) do |student|
          FactoryBot.create(:atp_intervention, student: student)
        end
      end

      factory :student_with_one_non_atp_intervention do
        after(:create) do |student|
          FactoryBot.create(:intervention, :non_atp_intervention, student: student)
        end
      end

      factory :student_with_multiple_atp_interventions do
        after(:create) do |student|
          FactoryBot.create(:atp_intervention, student: student)
          FactoryBot.create(:more_recent_atp_intervention, student: student)
        end
      end
    end

    # Test STAR Instructional Reading Level
    factory :student_behind_in_reading do
      grade "5"
      after(:create) do |student|
        FactoryBot.create(:star_assessment_with_irl_below_4, student: student)
      end
    end

    factory :student_ahead_in_reading do
      grade "5"
      after(:create) do |student|
        FactoryBot.create(:star_assessment_with_irl_above_5, student: student)
      end
    end

    factory :student_with_absence do
      after(:create) do |student|
        student_school_years = FactoryBot.create_list(:student_school_year, 1, student: student)
        FactoryBot.create(:absence, student_school_year: student_school_years.first)
      end
    end

    factory :student_with_discipline_incident do
      after(:create) do |student|
        student_school_years = FactoryBot.create_list(:student_school_year, 1, student: student)
        FactoryBot.create(:discipline_incident, student_school_year: student_school_years.first)
      end
    end
  end
end
