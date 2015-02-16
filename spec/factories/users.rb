FactoryGirl.define do

  sequence(:email) { |n| "superteacher#{n}@somerville.edu" }
  
  factory :user do
    password "PairShareCompare"
    email { FactoryGirl.generate(:email) }
    phone "+15005550006"    # This is a Twilio magic number
  end

  factory :user_without_phone, class: User do
    password "PairShareCompare"
    email { FactoryGirl.generate(:email) }
  end

end