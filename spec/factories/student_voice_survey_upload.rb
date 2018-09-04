FactoryBot.define do

  factory :student_voice_survey_upload do
    association :uploaded_by_educator, factory: :educator

    sequence :file_name do |n|
      "file_name_#{n}.csv"
    end
    sequence :file_size do |n|
      (rand() * 10000).to_i
    end
    sequence :file_digest do |n|
      Digest::SHA256.hexdigest(n.to_s)
    end

    completed { true }
    created_at { Time.now }
    updated_at { Time.now }
    stats do
      {
        created_records_count: -1,
        invalid_row_columns_count: -1,
        invalid_student_local_id_count: -1,
        invalid_student_lodal_ids_list: -1
      }
    end
  end
end
