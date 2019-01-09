class SyncController < ApplicationController
  skip_before_action :authenticate_educator!, only: [:push]
  skip_before_action :verify_authenticity_token, only: [:push]

  # TODO authentication
  # TODO not sure why `sync` is here
  # TODO not sure why safe_params[:values].size is 0
  def push
    # safe_params = params.permit(:key, :secret, values: [{}], sync: {})
    lines = params[:values].drop(2).map do |row|
      {
        'Student LASID' => row[0],
        'Student full name' => row[1],
        'Staff last name' => row[2],
        'Date of assessment' => row[3],
        'LNF Letters per minute' => row[4]
      }
    end
    puts lines.to_json
    head :ok
  end
end
