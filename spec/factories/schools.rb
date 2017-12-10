FactoryGirl.define do

  factory :school do
    sequence(:state_id) {|n| n }
    sequence(:slug) {|n| "slug#{n}" }
    sequence(:local_id) {|n| "LOCAL_ID_#{n}" }
  end

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

  factory :shs, class: School do
    state_id 33
    slug 'shs'
    local_id "SHS"
    school_type "HS"
  end

  trait :with_educator do
    after(:create) do |school|
      school.educators << FactoryGirl.create(:educator, full_name: 'Stephenson, Neal')
    end
  end

end
