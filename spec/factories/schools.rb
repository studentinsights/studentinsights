FactoryGirl.define do

  factory :healey, class: School do
    state_id 15
    slug 'hea'
    local_id "HEA"
  end

  factory :brown, class: School do
    state_id 75
    slug 'brn'
    local_id "BRN"
  end

end
