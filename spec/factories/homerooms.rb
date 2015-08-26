FactoryGirl.define do

  sequence(:name) { |n| n.to_s }

  factory :homeroom do
    name { FactoryGirl.generate(:name) }
    factory :homeroom_with_student do
      after(:create) do |homeroom|
        homeroom.students << FactoryGirl.create(:student)
      end
    end
    factory :homeroom_with_second_grader do
      after(:create) do |homeroom|
        homeroom.students << FactoryGirl.create(:second_grade_student)
      end
    end
    factory :homeroom_with_pre_k_student do
      after(:create) do |homeroom|
        homeroom.students << FactoryGirl.create(:pre_k_student)
      end
    end
    factory :homeroom_with_student_with_mcas_math_warning do
      after(:create) do |homeroom|
        homeroom.students << FactoryGirl.create(:student_with_mcas_math_warning_assessment)
      end
    end
    factory :homeroom_with_student_with_multiple_star_math_student_assessments do
      after(:create) do |homeroom|
        homeroom.students << FactoryGirl.create(:student_with_star_math_student_assessments_different_days)
      end
    end
  end
end
