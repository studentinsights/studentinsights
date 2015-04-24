FactoryGirl.define do
  
  factory :mcas_result_low, class: McasResult do
    ela_scaled 200
    ela_performance "W"
    ela_growth 10
    math_scaled 200
    math_performance "W"
    math_growth 10
  end

  factory :mcas_result_needs_improvement, class: McasResult do
    ela_performance "NI"
    math_performance "NI"
  end

  factory :mcas_result_high, class: McasResult do
    ela_scaled 280
    ela_performance "P"
    ela_growth 90
    math_scaled 280
    math_performance "P"
    math_growth 90
  end

  factory :mcas_result_without_math, class: McasResult do
    ela_scaled 280
    ela_performance "P"
    ela_growth 90
  end

  factory :mcas_result_without_ela, class: McasResult do
    math_scaled 280
    math_performance "P"
    math_growth 90
  end

end