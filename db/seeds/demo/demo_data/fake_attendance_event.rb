module FakeAttendanceEvent

  def self.data
    n = [true, false].sample
    {
      absence: n,
      tardy: !n,
      event_date: Time.at(Time.local(2010, 1, 1) + rand * (Time.now.to_f - Time.local(2010, 1, 1).to_f))
    }
  end

end
