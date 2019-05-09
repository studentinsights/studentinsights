class CounselorNotesController < ApplicationController
  before_action :ensure_authorized_for_feature!

  def inline_profile_json
    params.require(:student_id)
    params.permit(:time_now)
    params.permit(:limit)
    student = authorized_or_raise! { Student.find(params[:student_id]) }
    time_now = time_now_or_param(params[:time_now])
    limit = params.has_key?(:limit) ? params[:limit].to_i : 10;

    # Load feed cards just for this student
    feed = Feed.new([student])
    feed_cards = feed.all_cards(time_now, limit)

    render json: {
      feed_cards: feed_cards
    }
  end

  private
  def ensure_authorized_for_feature!
    current_educator.labels.include?('enable_counselor_notes_page')
  end
end