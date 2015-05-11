FactoryGirl.define do
  factory :star_result do
    factory :star_result_without_math do
    end
    factory :star_result_with_math do
      math_percentile_rank 99
    end
  end
end