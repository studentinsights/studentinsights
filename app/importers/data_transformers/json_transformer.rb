class JsonTransformer

  def transform(file)
  	require 'json'
  	JSON.parse(file)
  end
end
