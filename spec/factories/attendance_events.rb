FactoryGirl.define do
  factory :attendance_event do
    factory :absence do
      absence true
      event_date Time.new(2015, 1, 1)
    end
  end
end
