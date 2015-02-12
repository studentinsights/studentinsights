Rails.application.routes.draw do

  devise_for :users

  root 'students#index'

  resources :students
  
  get 'about' => 'pages#about'

end
