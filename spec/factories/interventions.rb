FactoryBot.define do

  factory :intervention do
    association :student
    association :intervention_type
    association :educator

    start_date Date.new(2014, 9, 9)
    number_of_hours 10

    trait :end_date do
      end_date Date.new(2014, 9, 12)
    end

    trait :custom_intervention_name do
      custom_intervention_name "More practice time!"
    end

    factory :atp_intervention do
      intervention_type { InterventionType.find_by_name('After-School Tutoring (ATP)') }
      factory :more_recent_atp_intervention do
        start_date Date.new(2015, 9, 9)
        number_of_hours 11
      end
    end

    trait :non_atp_intervention do
      intervention_type { InterventionType.find_by_name('Attendance Contract') }
    end

  end
end
