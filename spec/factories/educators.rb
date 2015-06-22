FactoryGirl.define do

  sequence(:email) { |n| "superteacher#{n}@somerville.edu" }

  factory :educator do
    password "PairShareCompare"
    email { FactoryGirl.generate(:email) }

    factory :educator_with_homeroom do
      after(:create) do |educator|
        create(:homeroom, educator: educator)
      end
    end
    factory :educator_with_homeroom_with_student do
      after(:create) do |educator|
        homeroom = create(:homeroom, educator: educator)
        create(:student, homeroom: homeroom)
      end
    end
    factory :educator_with_homeroom_with_three_students do
      after(:create) do |educator|
        homeroom = create(:homeroom, educator: educator)
        3.times { create(:student, homeroom: homeroom) }
      end
    end
  end
end
