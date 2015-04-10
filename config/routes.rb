Rails.application.routes.draw do

  devise_for :educators

  authenticated :educator do
    root :to => "students#index", as: "authenticated_root"
  end
  
  root 'pages#about'
  get 'about' => 'pages#about'
  get 'demo' => 'pages#roster_demo'

  # Two factor
  # get '/get_pin' => 'users#get_pin', as: "get_pin"
  # post '/send_pin' => 'users#send_pin', as: "send_pin"

  resources :students

end
