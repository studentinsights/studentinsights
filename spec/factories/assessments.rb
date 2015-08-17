FactoryGirl.define do

  factory :student_assessment do
    date_taken DateTime.new(2015, 6, 19)

    factory :mcas_assessment do
      association :assessment_family, name: "MCAS"
      factory :mcas_math_assessment do
        association :assessment_subject, name: "Math"
        factory :mcas_math_warning_assessment do
          performance_level "W"
        end
        factory :mcas_math_advanced_assessment do
          performance_level "A"
        end
      end
      factory :mcas_ela_assessment do
        association :assessment_subject, name: "Math"
      end
      factory :star_assessment do
        association :assessment_family, name: "STAR"
        factory :star_math_assessment do
          association :assessment_subject, name: "Math"
          factory :star_math_warning_assessment do
            percentile_rank 8
          end
          factory :star_assessment_between_30_85 do
            percentile_rank 40
          end
        end
        factory :star_reading_assessment do
          association :assessment_subject, name: "Reading"
          factory :star_assessment_with_irl_above_5 do
            instructional_reading_level 6
          end
        end
      end
    end
    factory :dibels do
      association :assessment_family, name: "DIBELS"
      factory :dibels_with_performance_level do
        performance_level "Strategic"
      end
    end
    factory :access do
      association :assessment_family, name: "ACCESS"
    end
  end
  factory :student_assessment_without_date_taken, class: StudentAssessment do
  end
end
