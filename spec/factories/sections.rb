FactoryBot.define do
  sequence(:section_number_seq) { |n| "SECTION-#{n}" }

  factory :section do
    section_number { generate(:section_number_seq) }
    association :course
    term_local_id { 'FY' } # { Section::VALID_TERM_VALUES.sample }
    schedule { '1(M-R)' }
    room_number { 'M14' }
    district_school_year { SchoolYear.to_school_year(Time.now) + 1 }
  end
end
