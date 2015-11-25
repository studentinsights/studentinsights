FactoryGirl.define do
  factory :assessment do
    trait :mcas do
      family "MCAS"
    end
    trait :math do
      subject "Math"
    end
    trait :reading do
      subject "Reading"
    end
  end
end
