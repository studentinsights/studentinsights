# This script runs some regexs and codemods to convert:
# - dom.div(...) to React.createElement(...)
# - createEl(...) to React.createElement(...)
# - dom.div(...) into JSX
# - var into const where possible
# - (does not do ES6 class transform)
# usage: scripts/codemods/to_jsx.sh
#

FOLDER=$1 # spec/javascripts, or app/javascripts, etc.
for TARGET in $(find "$FOLDER" -name '*.js'); do
  echo "Transforming {$TARGET}...";

  # # dom.div({ foo: 'bar'}, 'hi!') -> <div foo="bar">{hi!}</div>
  find "$TARGET" -name '*.js*' |xargs perl -pi -e 's/dom\.(\w+)\(/React\.createElement\("$1", /g'

  # # createEl(Foo, { name: 'Kevin' }, 'hi!') -> <Foo name="Kevin">{hi!}</Foo>
  find "$TARGET" -name '*.js*' |xargs perl -pi -e 's/createEl\(/React\.createElement\(/g'

  # for getting codemod dependencies
  mkdir -p tmp/codemods

  # Tiny fork, see: https://github.com/kevinrobinson/react-codemod
  if [ ! -d tmp/codemods/react-codemod ] ; then
    git clone --depth 1 https://github.com/kevinrobinson/react-codemod tmp/codemods/react-codemod
  fi

  # TODO(ARS) -- figure out why this `yarn` is breaking
  # pushd tmp/codemods/react-codemod
  # yarn
  # popd
  jscodeshift -t tmp/codemods/react-codemod/transforms/create-element-to-jsx.js "$TARGET"
  # TODO(kr) ES6 class transform
  # jscodeshift -t tmp/codemods/react-codemod/transforms/class.js $TARGET


  # See https://github.com/cpojer/js-codemod
  if [ ! -d tmp/codemods/js-codemod ] ; then
    git clone --depth=1 https://github.com/cpojer/js-codemod tmp/codemods/js-codemod
  fi
  pushd tmp/codemods/js-codemod
  yarn
  popd
  jscodeshift -t tmp/codemods/js-codemod/transforms/no-vars.js "$TARGET"

  # Rename
  mv "$TARGET" "${TARGET%.js}.jsx"
done;
