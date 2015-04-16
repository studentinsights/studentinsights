FactoryGirl.define do
  
  factory :student_result_low, class: StudentResult do
    ela_scaled 200
    ela_performance "W"
    ela_growth 10
    math_scaled 200
    math_performance "W"
    math_growth 10
  end

  factory :student_result_high, class: StudentResult do
    ela_scaled 280
    ela_performance "P"
    ela_growth 90
    math_scaled 280
    math_performance "P"
    math_growth 90
  end

  factory :student_result_without_math, class: StudentResult do
    ela_scaled 280
    ela_performance "P"
    ela_growth 90
  end

  factory :student_result_without_ela, class: StudentResult do
    math_scaled 280
    math_performance "P"
    math_growth 90
  end

end