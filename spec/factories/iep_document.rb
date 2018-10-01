FactoryBot.define do
  factory :iep_document do
    association :student

    created_at { Time.now }
    file_name { "#{student.local_id}_IEPAtAGlance_#{student.first_name}_#{student.last_name}.pdf" }
    file_digest { SecureRandom.hex }
    file_size { 1000 + SecureRandom.random_number(100000) }
    s3_filename { "iep_pdfs/#{Digest::SHA256.hexdigest(student.local_id)}/#{created_at.strftime('%Y-%m-%d')}/#{file_digest}" }
  end
end
