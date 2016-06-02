Rails.application.routes.draw do

  namespace :admin do
    resources :educators
resources :schools
resources :student_assessments
resources :students
resources :homerooms
resources :student_risk_levels
resources :absences
resources :assessments
resources :discipline_incidents
resources :discontinued_services
resources :event_notes
resources :event_note_revisions
resources :event_note_types
resources :interventions
resources :intervention_types
resources :precomputed_query_docs
resources :school_years
resources :services
resources :service_types
resources :student_school_years
resources :tardies

    root to: "educators#index"
  end

  devise_for :educators
  authenticated :educator do
    root to: 'educators#homepage', as: 'educator_homepage'
  end
  get '/educators/reset'=> 'educators#reset_session_clock'
  get '/educators/services_dropdown/:id' => 'educators#names_for_dropdown'

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

  resources :homerooms, only: [:show]

  resources :schools, only: [:show] do
    get :star_reading, on: :member
    get :star_math, on: :member
  end
end
