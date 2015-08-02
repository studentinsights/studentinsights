FactoryGirl.define do

  factory :assessment do
    date_taken DateTime.new(2015, 6, 19)

    factory :mcas_assessment, class: Assessment do
      association :assessment_family, name: "MCAS"
      factory :mcas_math_assessment, class: Assessment do
        association :assessment_subject, name: "STAR"
        factory :mcas_math_warning_assessment, class: Assessment do
          performance_level "W"
        end
        factory :mcas_math_advanced_assessment, class: Assessment do
          performance_level "A"
        end
      end
      factory :star_assessment, class: Assessment do
        association :assessment_family, name: "STAR"
        factory :star_math_assessment, class: Assessment do
          factory :star_math_warning_assessment, class: Assessment do
            percentile_rank 8
          end
          factory :star_assessment_between_30_85, class: Assessment do
            percentile_rank 40
          end
          factory :star_assessment_with_irl_above_5, class: Assessment do
            instructional_reading_level 6
          end
        end
      end
    end
  end
  factory :assessment_without_date_taken, class: Assessment do
  end
end
