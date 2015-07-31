FactoryGirl.define do

  factory :assessment do
    date_taken DateTime.new(2015, 6, 19)

    factory :assessment_low, class: Assessment do
      ela_scaled 200
      ela_performance "W"
      ela_growth 10
      math_scaled 200
      math_performance "W"
      math_growth 10
    end
    factory :assessment_needs_improvement, class: Assessment do
      ela_performance "NI"
      math_performance "NI"
    end
    factory :assessment_high, class: Assessment do
      ela_scaled 280
      ela_performance "P"
      ela_growth 90
      math_scaled 280
      math_performance "P"
      math_growth 90
    end
    factory :assessment_without_math, class: Assessment do
      ela_scaled 280
      ela_performance "P"
      ela_growth 90
    end
    factory :assessment_without_ela, class: Assessment do
      math_scaled 280
      math_performance "P"
      math_growth 90
    end
  end
  factory :assessment_without_date_taken, class: Assessment do
  end
end
