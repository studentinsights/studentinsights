Rails.application.routes.draw do

  devise_for :educators

  authenticated :educator do
    root to: 'educators#homepage', as: 'educator_homepage'
  end

  root 'pages#about'
  get 'about' => 'pages#about'
  get 'no_homeroom' => 'pages#no_homeroom'
  get 'no_homerooms' => 'pages#no_homerooms'
  get 'not_authorized' => 'pages#not_authorized'

  get '/students/names' => 'students#names'
  get '/educators/reset'=> 'educators#reset_session_clock'

  resources :students do
    get :profile, on: :member
    get :deprecated_v1_profile, on: :member
    get :sped_referral, on: :member
    post :event_note, on: :member
    post :service, on: :member
  end
  resources :homerooms
  resources :interventions
  resources :progress_notes
  resources :student_notes
  resources :bulk_intervention_assignments
  resources :schools do
    get :star_reading, on: :member
    get :star_math, on: :member
  end
end
