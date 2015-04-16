FactoryGirl.define do
  
  factory :student do
    factory :student_we_want_to_update do
      state_identifier "10"
      home_language "English"
    end
    factory :student_with_homeroom do
      association :homeroom, name: "601"
    end
    factory :student_with_full_name do
      first_name Faker::Name.first_name
      last_name Faker::Name.last_name
    end
    factory :sped_student do
      sped true
    end
    factory :lep_student do
      limited_english_proficient true
    end
    factory :non_sped_student do
      sped false
    end
    factory :non_lep_student do
      limited_english_proficient false
    end
  end
end
