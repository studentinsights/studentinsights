Rails.application.routes.draw do
  # The priority is based upon order of creation: first created -> highest priority.
  # See how all your routes lay out with "rake routes".

  root 'pages#index'
  
  get '/sort_by_risk' => 'students#sort_by_risk'

end
