# Deletes two "window.shared ..." lines that we don't need now that we're transforming
# our code to JSX through react-rails:

# const dom = window.shared.ReactHelpers.dom; ...
# const createEl = window.shared.ReactHelpers.createEl; ...

JSX_DIRS=(
  components
  helpers
  restricted_notes
  school_overview
  service_uploads
  star_math
  star_reading
  student_profile
)

for dir in ${JSX_DIRS[@]}; do
  echo "Transforming files in ${dir}..."

  for TARGET in $(find "app/assets/javascripts/${dir}" -name '*.jsx'); do
    echo "Transforming {$TARGET}...";

    sed -i '' '/const dom = window.shared.ReactHelpers.dom;/d' "$TARGET"
    sed -i '' '/const createEl = window.shared.ReactHelpers.createEl;/d' "$TARGET"
    sed -i '' '/var dom = window.shared.ReactHelpers.dom;/d' "$TARGET"
  done;
done;
