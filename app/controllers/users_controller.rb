
class UsersController < ApplicationController

  def get_pin
  end

  def send_pin
    @user = User.find_by_email(users_params[:email])
    if @user.present?
      @phone = @user.phone

      if @phone.present?  
        @pin = @user.current_otp
        SMS.send_pin(@phone, @pin)
        flash[:notice] = "PIN sent via SMS."
        render "devise/sessions/new"
      else
        redirect_to get_pin_url, flash: { alert: "No phone number associated with that email." }
      end
    else
      redirect_to get_pin_url, flash: { alert: "No user found with that email." }
    end
  end

  def users_params
    params.require(:user).permit(:email)
  end

end
