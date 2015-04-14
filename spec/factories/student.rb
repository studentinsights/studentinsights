FactoryGirl.define do
  
  factory :student do
    factory :student_we_want_to_update do
      state_identifier "10"
      home_language "English"
    end
    factory :student_with_homeroom do
      association :homeroom, name: "601"
    end
  end
end
