FactoryGirl.define do

  factory :school_year do
    factory :sy_2014_2015 do
      name '2014-2015'
      start Date.new(2014, 8, 1)
    end
    factory :sy_2013_2014 do
      name '2013-2014'
      start Date.new(2013, 8, 1)
    end
    factory :sy_2012_2013 do
      name '2012-2013'
      start Date.new(2012, 8, 1)
    end
  end
end
