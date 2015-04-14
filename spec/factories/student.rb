FactoryGirl.define do
  
  factory :student do
  end

  factory :student_we_want_to_update, class: Student do
    state_identifier "10"
    home_language "English"
  end

end
