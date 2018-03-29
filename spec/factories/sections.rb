FactoryGirl.define do
  sequence(:section_number_seq) { |n| "SECTION-#{n}" }

  factory :section do
    section_number { generate(:section_number_seq) }
    association :course
    term_local_id "FY"
  end
end
