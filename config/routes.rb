Rails.application.routes.draw do

  devise_for :educators

  authenticated :educator do
    root :to => "homerooms#show", as: "roster"
  end

  root 'pages#about'
  get 'about' => 'pages#about'
  get 'no_homeroom' => 'pages#no_homeroom'
  get 'no_homerooms' => 'pages#no_homerooms'

  get '/students/names' => 'students#names'
  get '/educators/reset'=> 'educators#reset_session_clock'

  resources :students
  resources :homerooms
  resources :interventions
  resources :progress_notes
  resources :student_notes
  resources :bulk_intervention_assignments
  resources :schools do
    get :homerooms, on: :member
  end
end
