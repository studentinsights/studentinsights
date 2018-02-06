Rails.application.routes.draw do

  namespace :admin do
    resources :educators
    get '/authorization' => 'educators#authorization'
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

  get 'no_default_page' => 'pages#no_default_page'
  get 'not_authorized' => 'pages#not_authorized'

  if ENV['LETS_ENCRYPT_ENDPOINT']
    get ENV['LETS_ENCRYPT_ENDPOINT'] => 'pages#lets_encrypt_endpoint'
  end

  resources :students, only: [:show] do
    resources :event_notes, only: [:create, :update]
    collection do
      get :names
    end
    member do
      get :student_report
      get :restricted_notes
      post :service
    end
  end
  resources :services, only: [:destroy]
  resources :service_types, only: [:index]
  resources :event_note_attachments, only: [:destroy]
  resources :service_uploads, only: [:create, :index, :destroy] do
    collection do
      get :past
      get :lasids
    end
  end
  resources :homerooms, only: [:show]
  resources :sections, only: [:index, :show]
  resources :import_records, only: [:index]
  resources :iep_documents, only: [:show]

  resources :schools, only: [:show] do
    member do
      get :overview
      get :school_administrator_dashboard
      get :overview_json
      get :csv
    end
  end
end
