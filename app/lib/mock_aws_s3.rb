class MockAwsS3
  class MockObject
    def initialize(key)
      @key = key
    end

    VALID_KEYS = [
      'demo-student-photo-small-172x207.jpg',
      'demo-student-photo-large-308x364.jpg',
    ]

    def body
      # Validate strictly here because in general we don't want to send paths
      # that include variables down to the filesystem. Even though this is a Mock
      # object that will only be used in development/demo environments.
      raise 'Invalid mock S3 object!' unless VALID_KEYS.include?(@key)

      MockObjectBody.new("#{Rails.root}/public/#{@key}")
    end
  end

  class MockObjectBody
    def initialize(path)
      @path = path
    end

    def read
      File.read(@path)
    end
  end

  def get_object(key:, bucket:)
    MockObject.new(key)
  end
end
