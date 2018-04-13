FactoryBot.define do

  sequence(:email) { |n| "superteacher#{n}@somerville.edu" }
  sequence(:staff_local_id) { |n| "000#{n}" }

  factory :educator do
    password 'demo-password' # All the same for local development and the demo site
    email { FactoryBot.generate(:email) }
    local_id { FactoryBot.generate(:staff_local_id) }
    association :school

    trait :admin do
      admin true
      schoolwide_access true
      restricted_to_sped_students false
      restricted_to_english_language_learners false
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
