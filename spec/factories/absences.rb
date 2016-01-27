FactoryGirl.define do
  factory :absence do
    student_school_year
    occurred_at { Time.now }
  end
end
