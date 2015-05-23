FactoryGirl.define do

  factory :school_year do
    factory :current_school_year do
      name '2014-2015'
      start Date.new(2014, 8, 1)
    end
    factory :last_school_year do
      name '2013-2014'
      start Date.new(2013, 8, 1)
    end
    factory :two_school_years_ago do
      name '2012-2013'
      start Date.new(2012, 8, 1)
    end
  end
end
