module FakeAttendanceEvent

  def self.data
    n = [true, false].sample

    {
      absence: n,
      tardy: !n
    }
  end

end
