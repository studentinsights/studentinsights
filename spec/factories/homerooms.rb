FactoryBot.define do

  sequence(:name) { |n| n.to_s }

  trait :named_hea_100 do
    name "HEA 100"
  end

  factory :homeroom do
    name { FactoryBot.generate(:name) }
    association :school

    factory :homeroom_with_student do
      after(:create) do |homeroom|
        homeroom.students << FactoryBot.create(:student, :registered_last_year, homeroom: homeroom)
      end
    end

    factory :homeroom_with_second_grader do
      after(:create) do |homeroom|
        homeroom.students << FactoryBot.create(:second_grade_student, :registered_last_year, homeroom: homeroom)
      end
    end

    factory :homeroom_with_pre_k_student do
      after(:create) do |homeroom|
        homeroom.students << FactoryBot.create(:pre_k_student, :registered_last_year, homeroom: homeroom)
      end
    end

  end
end
