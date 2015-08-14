Rails.application.routes.draw do

  devise_for :educators

  authenticated :educator do
    root :to => "students#index", as: "roster"
  end

  root 'pages#about'
  get 'about' => 'pages#about'
  get 'demo' => 'pages#roster_demo'

  resources :students

  resources :homerooms do
    resources :students
  end

  post '/interventions/' => 'interventions#create'

end
