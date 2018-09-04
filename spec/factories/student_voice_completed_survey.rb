FactoryBot.define do

  factory :student_voice_completed_survey do
    association :student_voice_survey_upload
    association :student

    form_timestamp { DateTime.new(2016, 4, 9) }
    first_name { student.first_name }
    student_lasid { student.local_id }
    created_at { Time.now }
    updated_at { Time.now }

    sequence :proud do |n|
      "proud quote #{n}"
    end
    sequence :best_qualities do |n|
      "best_qualities quote #{n}"
    end
    sequence :activities_and_interests do |n|
      "activities_and_interests quote #{n}"
    end
    sequence :nervous_or_stressed do |n|
      "nervous_or_stressed quote #{n}"
    end
    sequence :learn_best do |n|
      "learn_best quote #{n}"
    end
  end
end
