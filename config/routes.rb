Rails.application.routes.draw do

  devise_for :users

  root 'pages#index'

  get 'home' => 'pages#index'
  get 'about' => 'pages#about'


end
