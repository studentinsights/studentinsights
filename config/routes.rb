Rails.application.routes.draw do

  devise_for :educators

  authenticated :educator do
    root :to => "students#index", as: "authenticated_root"
  end
  
  root 'pages#about'
  get 'about' => 'pages#about'
  get 'demo' => 'pages#roster_demo'

  resources :students

  resources :homerooms do
    resources :students
  end
end
