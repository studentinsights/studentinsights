FactoryGirl.define do
  factory :assessment do
    scale_score 1
    growth_percentile 1
    performance_level "MyString"
    assessment_family_id 1
    assessment_subject_id 1
    date_taken "2015-07-27 13:46:41"
    student_id 1
  end
end
