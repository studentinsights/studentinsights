FactoryGirl.define do

  sequence(:email) { |n| "superteacher#{n}@somerville.edu" }
  sequence(:staff_local_id) { |n| "000#{n}" }

  factory :educator do
    password "PairShareCompare"
    email { FactoryGirl.generate(:email) }
    local_id { FactoryGirl.generate(:staff_local_id) }
    association :school

    trait :admin do
      admin true
      schoolwide_access true
      restricted_to_sped_students false
      restricted_to_english_language_learners false
    end

    trait :local_id_200 do
      local_id '200'
    end

    trait :without_local_id do
      local_id nil
    end

    trait :without_email do
      email nil
    end

    factory :educator_with_homeroom do
      after(:create) do |educator|
        create(:homeroom, educator: educator)
      end
    end
    factory :educator_with_grade_5_homeroom do
      after(:create) do |educator|
        create(:homeroom, educator: educator, grade: "5")
      end
    end
    factory :educator_with_homeroom_with_student do
      after(:create) do |educator|
        homeroom = create(:homeroom, educator: educator)
        create(:student, :with_risk_level, :registered_last_year, homeroom: homeroom)
      end
    end
    factory :educator_with_homeroom_with_three_students do
      after(:create) do |educator|
        homeroom = create(:homeroom, educator: educator)
        3.times { create(:student, :with_risk_level, :registered_last_year, homeroom: homeroom) }
      end
    end
    factory :educator_with_homeroom_with_student_with_mcas_math_warning do
      after(:create) do |educator|
        educator.homeroom = FactoryGirl.create(:homeroom_with_student_with_mcas_math_warning)
      end
    end
    factory :educator_with_homeroom_with_multiple_star_math_student_assessments do
      after(:create) do |educator|
        educator.homeroom = FactoryGirl.create(:homeroom_with_student_with_multiple_star_math_student_assessments)
      end
    end
  end
end
