Rails.application.routes.draw do

  devise_for :educators
  authenticated :educator do
    root to: 'educators#homepage', as: 'educator_homepage'
  end
  get '/educators/reset'=> 'educators#reset_session_clock'

  root 'pages#about'
  get 'about' => 'pages#about'
  get 'no_homeroom' => 'pages#no_homeroom'
  get 'no_homerooms' => 'pages#no_homerooms'
  get 'not_authorized' => 'pages#not_authorized'

  get '/students/names' => 'students#names'
  resources :students, only: [:show] do
    resources :event_notes, only: [:create, :update]
    member do
      get :sped_referral
      post :service
    end
  end
  resources :services, only: [:destroy]

  resources :homerooms, only: [:show]
  resources :interventions, only: [:create, :destroy]
  resources :progress_notes, only: [:create]
  resources :student_notes, only: [:create]

  resources :schools, only: [:show] do
    get :star_reading, on: :member
    get :star_math, on: :member
  end
end
