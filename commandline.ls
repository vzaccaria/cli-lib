
_        = require('underscore')
_.str    = require('underscore.string');
moment   = require 'moment'
fs       = require 'fs'
color    = require('ansi-color').set
os       = require('os')
shelljs  = require('shelljs')
table    = require('ansi-color-table')
ls       = require('LiveScript')
debug    = require('debug')('mp-parse')
path     = require('path')
q = require('q')
{escape} = shellwords = require("shellwords")
optimist = require('optimist')

debug = require('debug')('it.zaccaria.cli-lib')

_.mixin(_.str.exports());
_.str.include('Underscore.string', 'string');

otm      = if (os.tmpdir?) then os.tmpdir() else "/var/tmp"
cwd      = process.cwd()
tempdir  = undefined
tempr00t = undefined
tempsfx  = undefined

{ mkdir, cd, rm, exec, cat } = shelljs

setup-temporary-directory = (appname) ->
    debug "Setting up temporary directory"
    r00t = "#{otm}it.zaccaria.#appname"
    sfx = "#{moment().format('DDMMYY-HHmmss')}"
    dire = "#{r00t}/#sfx"
    debug r00t 
    debug sfx 
    debug dire

    mkdir '-p', r00t
    mkdir '-p', dire

    tempdir  := dire
    tempr00t := r00t
    tempsfx  := sfx

    return dire

remove-temporary-directory = (dir) ->
    debug "Removing #dir"
    cd tempr00t
    rm '-rf', tempsfx

_module = ->

    parlist = {}
    argv = {}

    state = {
        name        : "NA"
        description : ""
        author      : "Vittorio Zaccaria"
        year        : "2014"
        

        b        : (name, alias, def=false, description="") ->
                            if not name?
                                throw "Please provide a name for the option"
                            if not alias?
                                alias := name.charAt(0)
                            parlist[name] = 
                                alias: alias
                                description: description
                                boolean: true 
                                default: def
                            
        s        : (name, alias, def="", description="") ->
                            if not name?
                                throw "Please provide a name for the option"
                            if not alias?
                                alias := name.charAt(0)
                            parlist[name] = 
                                alias: alias
                                description: description
                                default: def

    }

    runT = (cmd, cb) ->
          if argv.verbose or argv.dry
            console.log cmd
          if not argv.dry 
            exec cmd, cb
          else 
            cb?()

    run = -> q.nfcall(runT, it)

    setup = (b) ->
        b?.apply(state)


    parse-args = (b) ->
        b?.apply(state)

        state.usage-string = """
        #{color(state.name, \bold)}. #{state.description}
        (c) #{state.author}, #{state.year}

        Usage: #{state.name} [--option=V | -o V] <file>
        """    
        state.b "help"    , "h" , false , "Help"
        state.b "verbose" , "v" , true  , "Show command execution"
        state.b "dry"     , "d" , false , "Dont execute commands - just display them"

        argv := optimist.usage(state.usage-string, parlist).argv
        file = (argv._)?[0]

        if argv.help || not file? 
            optimist.showHelp()
            process.exit(1)

        setup-temporary-directory state.name

        return argv

    bindir = ->
            d = q.defer()
            if not state.filename 
                d.reject("Cannot derive absolute package directory")
            else 
                fs.realpath state.filename, (err, rs) ->
                    if not err
                        dn = path.dirname(rs)
                        d.resolve(dn)
                    else 
                        d.reject("Error computing realpath")
            return d.promise

    graceful-exit = -> 
        remove-temporary-directory(tempdir) if tempdir?

    to-temp = (content, filename) ->
        content.to "#tempdir/#filename"

    from-temp = (filename) ->
        cat("#tempdir/filename")

    in-temporary-directory = (b) ->
        debug("moving to #tempdir")
        debug("Current dir #cwd")
        process.chdir tempdir
        debug("moved to #tempdir")
        move-back = ->
            debug "moving back to #cwd"
            process.chdir cwd 

        b().then move-back, move-back

    cfx = (o, n, s) -->
        (path.basename(s, o)) + n


    iface = { 
        setup                  : setup
        parse-args             : parse-args
        run                    : run
        bindir                 : bindir
        to-temp                : to-temp
        from-temp              : from-temp
        graceful-exit          : graceful-exit
        escape                 : escape
        cfx : cfx
        in-temporary-directory : in-temporary-directory
    }
  
    return iface
 
module.exports = _module()