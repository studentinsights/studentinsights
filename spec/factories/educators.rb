FactoryGirl.define do

  sequence(:email) { |n| "superteacher#{n}@somerville.edu" }
  
  factory :educator do
    password "PairShareCompare"
    email { FactoryGirl.generate(:email) }
  end

  factory :educator_with_homeroom, class: Educator do
    password "PairShareCompare"
    email { FactoryGirl.generate(:email) }
    after(:create) do |educator|
      create(:homeroom, educator: educator)
    end
  end
end