FactoryBot.define do

  factory :school do
    sequence(:local_id) {|n| n }
    sequence(:slug) {|n| "slug#{n}" }
    sequence(:name) {|n| "school ##{n}" }
    school_type { School::ORDERED_SCHOOL_TYPES.sample }
  end

  factory :healey, class: School do
    slug 'hea'
    name 'Healey school'
    local_id 'HEA'
    school_type 'ES'
  end

  factory :brown, class: School do
    slug 'brn'
    name 'Brown school'
    local_id 'BRN'
    school_type 'ES'
  end

  factory :shs, class: School do
    slug 'shs'
    name 'Somerville High'
    local_id 'SHS'
    school_type "HS"
  end

  trait :with_educator do
    after(:create) do |school|
      school.educators << FactoryBot.create(:educator, full_name: 'Stephenson, Neal')
    end
  end
end
