FactoryGirl.define do

  sequence(:name) { |n| n.to_s }
  
  factory :homeroom do
    name { FactoryGirl.generate(:name) }
  end
end
