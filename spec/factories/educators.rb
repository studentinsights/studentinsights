FactoryGirl.define do

  sequence(:email) { |n| "superteacher#{n}@somerville.edu" }
  
  factory :educator do
    password "PairShareCompare"
    email { FactoryGirl.generate(:email) }
    phone "+15005550006"    # This is a Twilio magic number
  end


  factory :educator_without_phone, class: Educator do
    password "PairShareCompare"
    email { FactoryGirl.generate(:email) }
  end

end