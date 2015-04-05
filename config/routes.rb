Rails.application.routes.draw do

  devise_for :users

  authenticated :user do
    root :to => "students#index", as: "authenticated_root"
  end
  
  root 'pages#about'
  get 'about' => 'pages#about'

  # Two factor
  # get '/get_pin' => 'users#get_pin', as: "get_pin"
  # post '/send_pin' => 'users#send_pin', as: "send_pin"

  resources :students

end
