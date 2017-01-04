Rails.application.routes.draw do

  namespace :admin do
    resources :educators
    root to: "educators#index"
  end

  devise_for :educators
  authenticated :educator do
    root to: 'educators#homepage', as: 'educator_homepage'
  end
  get '/educators/reset'=> 'educators#reset_session_clock'
  get '/educators/services_dropdown/:id' => 'educators#names_for_dropdown'
  get '/educators/districtwide' => 'educators#districtwide_admin_homepage'

  devise_scope :educator do
    root to: "devise/sessions#new"
  end

  get 'no_homeroom' => 'pages#no_homeroom'
  get 'no_homerooms' => 'pages#no_homerooms'
  get 'not_authorized' => 'pages#not_authorized'

  get '/students/names' => 'students#names'
  resources :students, only: [:show] do
    resources :event_notes, only: [:create, :update]
    member do
      get :sped_referral
      get :restricted_notes
      post :service
    end
  end
  resources :services, only: [:destroy]
  resources :event_note_attachments, only: [:destroy]

  resources :homerooms, only: [:show]

  resources :schools, only: [:show] do
    get :star_reading, on: :member
    get :star_math, on: :member
    get :csv, on: :member
  end
end
