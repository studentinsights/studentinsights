FactoryGirl.define do

  factory :student_assessment do
    date_taken DateTime.new(2015, 6, 19)

    factory :mcas_assessment do
      factory :mcas_math_assessment do
        association :assessment, subject: "Math", family: "MCAS"
        factory :mcas_math_warning_assessment do
          performance_level "W"
        end
        factory :mcas_math_advanced_assessment do
          performance_level "A"
        end
      end
      factory :mcas_ela_assessment do
        association :assessment, subject: "ELA", family: "MCAS"
      end
      factory :star_assessment do
        factory :star_math_assessment do
          association :assessment, subject: "Math", family: "STAR"
          factory :star_math_warning_assessment do
            percentile_rank 8
          end
          factory :star_assessment_between_30_85 do
            percentile_rank 40
          end
          factory :star_math_assessment_on_different_day do
            date_taken DateTime.new(2015, 6, 20)
          end
        end
        factory :star_reading_assessment do
          association :assessment, subject: "Reading", family: "STAR"
          factory :star_assessment_with_irl_above_5 do
            instructional_reading_level 6
          end
        end
      end
    end
    factory :dibels do
      association :assessment, family: "DIBELS"
      factory :dibels_with_performance_level do
        performance_level "Strategic"
      end
    end
    factory :access do
      association :assessment, family: "ACCESS"
    end
  end
  factory :student_assessment_without_date_taken, class: StudentAssessment do
  end
end
