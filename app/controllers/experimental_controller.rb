class ExperimentalController < ApplicationController
  def model_json
    bytes = IO.read('/Users/krobinson/Desktop/DANGER2/text-classifier/outjs/model.json')
    send_data(bytes, {
      disposition: "attachment; filename='model.json"
    })    
  end

  def group1_shard1of1
    bytes = IO.read('/Users/krobinson/Desktop/DANGER2/text-classifier/outjs/group1-shard1of1')
    send_data(bytes, {
      disposition: "attachment; filename='group1-shard1of1"
    })    
  end

  # ours, not from tensorflowjs converter
  def token_dictionary_json
    bytes = IO.read('/Users/krobinson/Desktop/DANGER2/text-classifier/outjs/token_dictionary.json')
    send_data(bytes, {
      disposition: "attachment; filename='token_dictionary.json"
    })    
  end
end
