FactoryBot.define do
  factory :student_voice_completed2020_survey do
    association :student_voice_survey_upload
    association :student

    form_timestamp { DateTime.new(2020, 4, 9) }
    student_lasid { student.local_id }
    created_at { Time.now }
    updated_at { Time.now }
    home_language { "English/Spanish" }
    pronouns { "they/them" }
    share_pronouns_with_family { "yes" }
    job { "no" }
    job_hours { "N/A" }
    sibling_care { "no" }
    sibling_care_time { "N/A" }
    reliable_internet { "Yes" }
    devices { "chromebook;additional laptop/desktop;cell phone" }
    sharing_space { "Yes" }
    camera_comfort { "No" }
    mic_comfort { "Yes" }

    sequence :shs_adult do |n|
      "Yes, I can see  adult#{n}"
    end
    sequence :mentor_schedule do |n|
      "mentor_schedule #{n}"
    end
    sequence :guardian_email do |n|
      "#{n}@example.com"
    end
    sequence :guardian_numbers do |n|
      "#{n}#{n}#{n}-#{n}#{n}#{n}#{n}"
    end
    sequence :remote_learning_difficulties do |n|
      "difficulty #{n}"
    end
    sequence :remote_learning_likes do |n|
      "Like #{n}"
    end
    sequence :remote_learning_struggles do |n|
      "Struggle #{n}"
    end
    sequence :camera_comfort_reasons do |n|
      "camera comfort reason #{n}"
    end
    sequence :mic_comfort_reasons do |n|
      "mic comfort reason #{n}"
    end
    sequence :learning_style do |n|
      "learning_style #{n}"
    end
    sequence :outside_school_activity do |n|
      "activity #{n}"
    end
    sequence :personal_characteristics do |n|
      "characteristic #{n}"
    end
    sequence :three_words do |n|
      "three word description #{n}"
    end
  end
end
