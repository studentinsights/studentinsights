Rails.application.routes.draw do

  namespace :admin do
    resources :educators
    get '/authorization' => 'educators#authorization'
    root to: "educators#index"
  end

  scope '/admin' do
    get 'import_records' => 'ui#ui'
    get '/api/import_records' => 'import_records#import_records_json'
  end

  get '/api/educators/:id' => 'educators#show'
  get '/api/schools/:id/courses' => 'schools#courses_json'
  get 'api/schools/:id/absences/data' => 'schools#absence_dashboard_data'
  get 'api/schools/:id/tardies/data' => 'schools#tardies_dashboard_data'
  get 'api/schools/:id/discipline/data' => 'schools#discipline_dashboard_data'
  get '/api/home/students_with_low_grades_json' => 'home#students_with_low_grades_json'
  get '/api/home/students_with_high_absences_json' => 'home#students_with_high_absences_json'
  get '/api/home/feed_json' => 'home#feed_json'
  get '/api/district/enrollment_json' => 'district#enrollment_json'

  devise_for :educators
  authenticated :educator do
    root to: 'educators#homepage', as: 'educator_homepage'
  end
  devise_scope :educator do
    root to: "devise/sessions#new"
  end

  get '/educators/view/:id' => 'ui#ui'
  get '/educators/districtwide' => 'educators#districtwide_admin_homepage'
  get '/educators/notes_feed'=> 'educators#notes_feed'
  get '/educators/notes_feed_json'=> 'educators#notes_feed_json'
  get '/educators/reset'=> 'educators#reset_session_clock'
  get '/educators/services_dropdown/:id' => 'educators#names_for_dropdown'
  get '/home' => 'ui#ui'

  get 'no_default_page' => 'pages#no_default_page'
  get 'not_authorized' => 'pages#not_authorized'

  if ENV['LETS_ENCRYPT_ENDPOINT']
    get ENV['LETS_ENCRYPT_ENDPOINT'] => 'pages#lets_encrypt_endpoint'
  end

  get '/students/names' => 'students#names'
  get '/students/lasids' => 'students#lasids'
  resources :students, only: [:show] do
    resources :event_notes, only: [:create, :update]
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
    end
  end
  resources :homerooms, only: [:show]
  resources :sections, only: [:index, :show]
  resources :iep_documents, only: [:show]

  resources :schools, only: [:show] do
    member do
      get :overview
      get :school_administrator_dashboard
      get :overview_json
      get :csv
      get 'absences' => 'ui#ui'
      get 'tardies' => 'ui#ui'
      get 'discipline' => 'ui#ui'
      get 'courses' => 'ui#ui'
      get 'equity/principal' => 'ui#ui'
    end
  end

  resource :district, only: [] do
    member do
      get 'enrollment' => 'ui#ui'
    end
  end
end
