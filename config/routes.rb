Rails.application.routes.draw do
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html

  namespace :admin do
    resources :educators
    get '/authorization' => 'educators#authorization'
    post '/masquerade/become' => 'masquerade#become'
    post '/masquerade/clear' => 'masquerade#clear'
    root to: "educators#index"
  end

  scope '/admin' do
    get '/import_records' => 'ui#ui'
    get '/api/import_records' => 'import_records#import_records_json'
    
    get '/sample_students' => 'ui#ui'
    get '/api/sample_students_json' => 'students#sample_students_json'

    get '/student_voice_survey_uploads' => 'ui#ui'
    post '/api/student_voice_survey_uploads' => 'student_voice_survey_uploads#upload'
    get '/api/student_voice_survey_uploads' => 'student_voice_survey_uploads#index'
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
  get '/api/class_lists/experimental_workspaces_with_equity_json' => 'class_lists#experimental_workspaces_with_equity_json'

  # home feed
  get '/api/home/students_with_low_grades_json' => 'home#students_with_low_grades_json'
  get '/api/home/students_with_high_absences_json' => 'home#students_with_high_absences_json'
  get '/api/home/feed_json' => 'home#feed_json'
  get '/api/district/enrollment_json' => 'district#enrollment_json'

  # homeroom
  get '/api/homerooms/:id/homeroom_json' => 'homerooms#homeroom_json'

  # sections
  get '/api/sections/:id/section_json' => 'sections#section_json'
  get '/api/educators/my_sections_json' => 'sections#my_sections_json'

  # student profile
  get '/api/students/:id/profile_json' => 'profile#json'

  # transition notes: creating/updating, or reading restricted notes
  post '/api/students/:student_id/update_transition_note' => 'transition_notes#update'
  get '/api/students/:student_id/restricted_transition_note_json' => 'transition_notes#restricted_transition_note_json'

  # event_notes: creating/updating notes, or reading restricted notes
  post '/api/event_notes' => 'event_notes#create'
  patch '/api/event_notes/:id' => 'event_notes#update'
  get '/api/event_notes/:id/restricted_note_json' => 'event_notes#restricted_note_json'
  delete '/api/event_notes/attachments/:event_note_attachment_id' => 'event_notes#destroy_attachment'


  ### experimental
  # HS tiers
  get '/api/tiering/:school_id/show_json' => 'tiering#show_json'

  # is service working?
  get '/api/is_service_working_json/:service_type_id/' => 'is_service_working#is_service_working_json'


  ### internal
  # login activity security monitoring
  get '/api/login_activity' => 'login_activities#index_json'


  devise_for :educators, controllers: { sessions: 'educators/sessions' }
  authenticated :educator do
    root to: 'educators#homepage', as: 'educator_homepage'
  end
  devise_scope :educator do
    root to: "devise/sessions#new"
  end

  get '/educators/view/:id' => 'ui#ui'
  get '/educators/districtwide' => 'educators#districtwide_admin_homepage'
  get '/educators/my_students'=> 'ui#ui'
  get '/educators/my_sections'=> 'ui#ui'
  get '/educators/notes_feed'=> 'educators#notes_feed'
  get '/educators/notes_feed_json'=> 'educators#notes_feed_json'
  get '/educators/reset'=> 'educators#reset_session_clock'
  get '/educators/services_dropdown/:id' => 'educators#names_for_dropdown'

  # home page
  get '/home' => 'ui#ui'

  # tiering
  get '/levels/:school_id' => 'ui#ui'

  # login activity security monitoring
  get '/login_activity' => 'ui#ui'

  # experimental "is service working?"
  get '/is_service_working' => 'ui#ui'

  # error pages
  get 'no_default_page' => 'pages#no_default_page'
  get 'not_authorized' => 'pages#not_authorized'

  # K8 homeroom page
  get '/homerooms/:id' => 'ui#ui', as: :homeroom

  get '/students/names' => 'students#names'
  get '/students/lasids' => 'students#lasids'

  resources :students, only: [:show] do
    member do
      get '/v3' => 'ui#ui'
      get '/student_report' => 'profile_pdf#student_report'
      get :restricted_notes
      get :photo
      post :service
    end
  end
  resources :services, only: [:destroy]
  resources :service_types, only: [:index]
  resources :service_uploads, only: [:create, :index, :destroy] do
    collection do
      get :past
    end
  end

  resources :sections, only: [:index]
  get '/sections/:id' => 'ui#ui', as: :section

  resources :iep_documents, only: [:show]

  resource :classlists, only: [] do
    member do
      get '' => 'ui#ui'
      get '/new' => 'ui#ui'
      get '/equity' => 'ui#ui'
      get '/:workspace_id' => 'ui#ui'
      get '/:workspace_id/text' => 'class_lists#text'
    end
  end

  get '/schools/:id' => 'ui#ui', as: :school
  resources :schools, only: [] do
    member do
      get :overview_json # also used by internal equity page
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
