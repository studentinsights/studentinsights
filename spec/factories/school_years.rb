FactoryGirl.define do
  factory :school_year do
    name { "#{Time.now.year}-#{Time.now.year + 1}" }
    start { Date.new(Time.now.year, 8, 1) }

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
