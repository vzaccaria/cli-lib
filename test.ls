{ parse-args, setup, bindir, graceful-exit } = require('./index')
{ to-temp, from-temp, in-temporary-directory, run } = require('./index')

setup ->
    @name = "my-first-app"
    @filename = __filename

parse-args ->
    @b "just-an-option"
    @s "a-string-option"


to-temp "Ciao" "pippo" 
in-temporary-directory -> 
    run "echo pippo"
.then graceful-exit()

