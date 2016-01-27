FactoryGirl.define do
  factory :tardy do
    student_school_year
    occurred_at { Time.now }
  end
end
