class MockAwsS3
  class MockObject
    def body
      MockObjectBody.new
    end
  end

  class MockObjectBody
    def read
      File.read("#{Rails.root}/public/student-placeholder.png")
    end
  end

  def initialize
  end

  def get_object(key:, bucket:)
    if key == 'student-placeholder.png'
      MockObject.new
    end
  end
end
