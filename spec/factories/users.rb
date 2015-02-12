FactoryGirl.define do

  sequence(:email) { |n| "superteacher#{n}@somerville.edu" }
  
  factory :user do
    password "PairShareCompare"
    email { FactoryGirl.generate(:email) }
  end

end