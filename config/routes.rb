Rails.application.routes.draw do

  devise_for :users

  authenticated :user do
    root :to => "students#index", :as => "authenticated_root"
  end
  
  root 'pages#about'
  get 'about' => 'pages#about'

  resources :students

end
