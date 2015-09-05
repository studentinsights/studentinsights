FactoryGirl.define do

  sequence(:email) { |n| "superteacher#{n}@somerville.edu" }

  factory :educator do
    password "PairShareCompare"
    email { FactoryGirl.generate(:email) }

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
        create(:student, homeroom: homeroom)
      end
    end
    factory :educator_with_homeroom_with_three_students do
      after(:create) do |educator|
        homeroom = create(:homeroom, educator: educator)
        3.times { create(:student, homeroom: homeroom) }
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
    factory :educator_with_homeroom_with_one_atp_intervention do
      after(:create) do |educator|
        educator.homeroom = FactoryGirl.create(:homeroom_with_one_atp_intervention)
      end
    end
    factory :educator_with_homeroom_with_one_non_atp_intervention do
      after(:create) do |educator|
        educator.homeroom = FactoryGirl.create(:homeroom_with_one_non_atp_intervention)
      end
    end
    factory :educator_with_homeroom_with_multiple_atp_interventions do
      after(:create) do |educator|
        educator.homeroom = FactoryGirl.create(:homeroom_with_multiple_atp_interventions)
      end
    end
  end
end
