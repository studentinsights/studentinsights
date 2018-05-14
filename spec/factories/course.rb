FactoryBot.define do
  sequence(:course_number_seq) { |n| "COURSE-#{n}" }

  factory :course do
    course_number { generate(:course_number_seq) }
    association :school
  end
end
