FactoryBot.define do
  factory :assessment do
    trait :mcas do
      family "MCAS"
    end
    trait :math do
      subject "Mathematics"
    end
    trait :reading do
      subject "Reading"
    end
    trait :ela do
      subject "ELA"
    end
    trait :star do
      family "STAR"
    end
    trait :access do
      family "ACCESS"
      subject "Composite"
    end
  end
end
