FactoryGirl.define do
  factory :import_record_detail do
    importer "SPEC TEST"
    association :import_record
  end
end
