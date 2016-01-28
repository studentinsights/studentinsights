FactoryGirl.define do
  factory :discipline_incident do
    occurred_at { Time.now }
    student_school_year
  end
end
