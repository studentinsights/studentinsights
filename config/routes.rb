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

  get '/api/educators/view/:id' => 'educators#show'
  get '/api/educators/my_students_json' => 'educators#my_students_json'
  get '/api/schools/:id/courses' => 'schools#courses_json'

  # school leader dashboards
  get '/api/schools/:id/absences/data' => 'schools#absence_dashboard_data'
  get '/api/schools/:id/tardies/data' => 'schools#tardies_dashboard_data'
  get '/api/schools/:id/discipline/data' => 'schools#discipline_dashboard_data'

  # classroom list creator
  get '/api/class_lists/workspaces_json' => 'class_lists#workspaces_json'
  get '/api/class_lists/:workspace_id/available_grade_levels_json' => 'class_lists#available_grade_levels_json'
  get '/api/class_lists/:workspace_id/students_for_grade_level_next_year_json' => 'class_lists#students_for_grade_level_next_year_json'
  post '/api/class_lists/:workspace_id/teacher_updated_class_list_json' => 'class_lists#teacher_updated_class_list_json'
  post '/api/class_lists/:workspace_id/principal_revised_class_list_json' => 'class_lists#principal_revised_class_list_json'
  get '/api/class_lists/:workspace_id/class_list_json' => 'class_lists#class_list_json'
  get '/api/class_lists/:workspace_id/students/:student_id/profile_json' => 'class_lists#profile_json'

  # home feed
  get '/api/home/students_with_low_grades_json' => 'home#students_with_low_grades_json'
  get '/api/home/students_with_high_absences_json' => 'home#students_with_high_absences_json'
  get '/api/home/feed_json' => 'home#feed_json'
  get '/api/district/enrollment_json' => 'district#enrollment_json'

  # HS tiers
  get '/api/tiering/:school_id/show_json' => 'tiering#show_json'

  devise_for :educators
  authenticated :educator do
    root to: 'educators#homepage', as: 'educator_homepage'
  end
  devise_scope :educator do
    root to: "devise/sessions#new"
  end

  get '/educators/view/:id' => 'ui#ui'
  get '/educators/districtwide' => 'educators#districtwide_admin_homepage'
  get '/educators/my_students'=> 'ui#ui'
  get '/educators/notes_feed'=> 'educators#notes_feed'
  get '/educators/notes_feed_json'=> 'educators#notes_feed_json'
  get '/educators/reset'=> 'educators#reset_session_clock'
  get '/educators/services_dropdown/:id' => 'educators#names_for_dropdown'

  # home page
  get '/home' => 'ui#ui'

  # tiering
  get '/levels/:school_id' => 'ui#ui'

  get 'no_default_page' => 'pages#no_default_page'
  get 'not_authorized' => 'pages#not_authorized'

  get '/students/names' => 'students#names'
  get '/students/lasids' => 'students#lasids'
  post '/students/:student_id/update_transition_note' => 'transition_notes#update'

  resources :students, only: [:show] do
    resources :event_notes, only: [:create, :update]

    member do
      get :student_report
      get :restricted_notes
      get :photo
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

  resource :classlists, only: [] do
    member do
      get '' => 'ui#ui'
      get '/new' => 'ui#ui'
      get '/:workspace_id' => 'ui#ui'
    end
  end

  resources :schools, only: [:show] do
    member do
      get :overview
      get :overview_json
      get :csv
      get 'absences' => 'ui#ui'
      get 'tardies' => 'ui#ui'
      get 'discipline' => 'ui#ui'
      get 'courses' => 'ui#ui'
      get 'equity/explore' => 'ui#ui'
    end
  end

  resource :district, only: [] do
    member do
      get 'enrollment' => 'ui#ui'
    end
  end
end
