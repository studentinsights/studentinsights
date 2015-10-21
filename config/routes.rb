Rails.application.routes.draw do

  devise_for :educators

  authenticated :educator do
    root :to => "homerooms#show", as: "roster"
  end

  root 'pages#about'
  get 'about' => 'pages#about'
  get 'demo' => 'pages#roster_demo'

  get '/students/names' => 'students#names'
  resources :students
  resources :homerooms
  resources :interventions
  resources :bulk_intervention_assignments

end
