class MockAwsS3
  class MockObject
    def initialize(key)
      @key = key
    end

    def body
      MockObjectBody.new(@key)
    end
  end

  class MockObjectBody
    def initialize(key)
      @key = key
    end

    SMALL_PHOTO = 'demo-student-photo-small-172x207.jpg'
    LARGE_PHOTO = 'demo-student-photo-large-308x364.jpg'

    def read
      if @key == SMALL_PHOTO
        File.read("#{Rails.root}/public/#{SMALL_PHOTO}")
      elsif @key == LARGE_PHOTO
        File.read("#{Rails.root}/public/#{LARGE_PHOTO}")
      else
        raise 'Invalid mock S3 object!'
      end
    end
  end

  def get_object(key:, bucket:)
    MockObject.new(key)
  end
end
