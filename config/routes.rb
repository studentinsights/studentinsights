Rails.application.routes.draw do

  devise_for :educators

  authenticated :educator do
    root :to => "homerooms#show", as: "roster"
  end

  root 'pages#about'
  get 'about' => 'pages#about'
  get 'demo' => 'pages#roster_demo'

  resources :students
  resources :homerooms
  resources :bulk_intervention_assignments
  post '/interventions/' => 'interventions#create'

end
