FactoryBot.define do
  factory :assessment do
    sequence(:family) { Assessment::VALID_FAMILY_VALUES.sample }
    subject do
      case family
        when 'MCAS','Next Gen MCAS' then Assessment::VALID_MCAS_SUBJECTS.sample
        when 'ACCESS' then Assessment::VALID_ACCESS_SUBJECTS.sample
        when 'STAR' then Assessment::VALID_STAR_SUBJECTS.sample
        when 'DIBELS' then nil
      end
    end
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
