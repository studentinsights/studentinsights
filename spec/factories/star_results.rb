FactoryGirl.define do
  factory :star_result do
    date_taken DateTime.new(2015, 6, 19)

    factory :star_result_without_math do
    end
    factory :star_result_with_math do
      math_percentile_rank 99
    end
  end
  factory :star_result_without_date_taken, class: StarResult do
  end
end
