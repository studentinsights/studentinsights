FactoryGirl.define do

  sequence(:email) { |n| "superteacher#{n}@somerville.edu" }
  sequence(:staff_local_id) { |n| "000#{n}" }

  factory :educator do
    password "PairShareCompare"
    email { FactoryGirl.generate(:email) }
    local_id { FactoryGirl.generate(:staff_local_id) }
    association :school

    trait :admin do
      admin true
      schoolwide_access true
      restricted_to_sped_students false
      restricted_to_english_language_learners false
    end

    trait :local_id_200 do
      local_id '200'
    end

    trait :without_local_id do
      local_id nil
    end

    trait :without_email do
      email nil
    end

    factory :educator_with_homeroom do
      after(:create) do |educator|
        create(:homeroom, educator: educator)
      end
    end

  end
end
