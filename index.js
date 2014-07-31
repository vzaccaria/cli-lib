(function(){
  var _, moment, fs, color, os, shelljs, table, ls, debug, path, q, shellwords, escape, optimist, otm, cwd, tempdir, tempr00t, tempsfx, mkdir, cd, rm, exec, cat, setupTemporaryDirectory, removeTemporaryDirectory, _module;
  _ = require('underscore');
  _.str = require('underscore.string');
  moment = require('moment');
  fs = require('fs');
  color = require('ansi-color').set;
  os = require('os');
  shelljs = require('shelljs');
  table = require('ansi-color-table');
  ls = require('LiveScript');
  debug = require('debug')('mp-parse');
  path = require('path');
  q = require('q');
  escape = (shellwords = require("shellwords")).escape;
  optimist = require('optimist');
  debug = require('debug')('it.zaccaria.cli-lib');
  _.mixin(_.str.exports());
  _.str.include('Underscore.string', 'string');
  otm = os.tmpdir != null ? os.tmpdir() : "/var/tmp";
  cwd = process.cwd();
  tempdir = undefined;
  tempr00t = undefined;
  tempsfx = undefined;
  mkdir = shelljs.mkdir, cd = shelljs.cd, rm = shelljs.rm, exec = shelljs.exec, cat = shelljs.cat;
  setupTemporaryDirectory = function(appname){
    var r00t, sfx, dire;
    debug("Setting up temporary directory");
    r00t = otm + "it.zaccaria." + appname;
    sfx = moment().format('DDMMYY-HHmmss') + "";
    dire = r00t + "/" + sfx;
    debug(r00t);
    debug(sfx);
    debug(dire);
    mkdir('-p', r00t);
    mkdir('-p', dire);
    tempdir = dire;
    tempr00t = r00t;
    tempsfx = sfx;
    return dire;
  };
  removeTemporaryDirectory = function(dir){
    debug("Removing " + dir);
    cd(tempr00t);
    return rm('-rf', tempsfx);
  };
  _module = function(){
    var parlist, argv, state, runT, run, setup, parseArgs, bindir, gracefulExit, toTemp, fromTemp, inTemporaryDirectory, cfx, iface;
    parlist = {};
    argv = {};
    state = {
      name: "NA",
      description: "",
      author: "Vittorio Zaccaria",
      year: "2014",
      b: function(name, alias, def, description){
        def == null && (def = false);
        description == null && (description = "");
        if (name == null) {
          throw "Please provide a name for the option";
        }
        if (alias == null) {
          alias = name.charAt(0);
        }
        return parlist[name] = {
          alias: alias,
          description: description,
          boolean: true,
          'default': def
        };
      },
      s: function(name, alias, def, description){
        def == null && (def = "");
        description == null && (description = "");
        if (name == null) {
          throw "Please provide a name for the option";
        }
        if (alias == null) {
          alias = name.charAt(0);
        }
        return parlist[name] = {
          alias: alias,
          description: description,
          'default': def
        };
      }
    };
    runT = function(cmd, cb){
      if (argv.verbose || argv.dry) {
        console.log(cmd);
      }
      if (!argv.dry) {
        return exec(cmd, cb);
      } else {
        return typeof cb === 'function' ? cb() : void 8;
      }
    };
    run = function(it){
      return q.nfcall(runT, it);
    };
    setup = function(b){
      return b != null ? b.apply(state) : void 8;
    };
    parseArgs = function(b){
      var file, ref$;
      if (b != null) {
        b.apply(state);
      }
      state.usageString = "" + color(state.name, 'bold') + ". " + state.description + "\n(c) " + state.author + ", " + state.year + "\n\nUsage: " + state.name + " [--option=V | -o V] <file>";
      state.b("help", "h", false, "Help");
      state.b("verbose", "v", true, "Show command execution");
      state.b("dry", "d", false, "Dont execute commands - just display them");
      argv = optimist.usage(state.usageString, parlist).argv;
      file = (ref$ = argv._) != null ? ref$[0] : void 8;
      if (argv.help || file == null) {
        optimist.showHelp();
        process.exit(1);
      }
      setupTemporaryDirectory(state.name);
      return argv;
    };
    bindir = function(){
      var d;
      d = q.defer();
      if (!state.filename) {
        d.reject("Cannot derive absolute package directory");
      } else {
        fs.realpath(state.filename, function(err, rs){
          var dn;
          if (!err) {
            dn = path.dirname(rs);
            return d.resolve(dn);
          } else {
            return d.reject("Error computing realpath");
          }
        });
      }
      return d.promise;
    };
    gracefulExit = function(){
      if (tempdir != null) {
        return removeTemporaryDirectory(tempdir);
      }
    };
    toTemp = function(content, filename){
      return content.to(tempdir + "/" + filename);
    };
    fromTemp = function(filename){
      return cat(tempdir + "/filename");
    };
    inTemporaryDirectory = function(b){
      var moveBack;
      debug("moving to " + tempdir);
      debug("Current dir " + cwd);
      process.chdir(tempdir);
      debug("moved to " + tempdir);
      moveBack = function(){
        debug("moving back to " + cwd);
        return process.chdir(cwd);
      };
      return b().then(moveBack, moveBack);
    };
    cfx = curry$(function(o, n, s){
      return path.basename(s, o) + n;
    });
    iface = {
      setup: setup,
      parseArgs: parseArgs,
      run: run,
      bindir: bindir,
      toTemp: toTemp,
      fromTemp: fromTemp,
      gracefulExit: gracefulExit,
      escape: escape,
      cfx: cfx,
      inTemporaryDirectory: inTemporaryDirectory
    };
    return iface;
  };
  module.exports = _module();
  function curry$(f, bound){
    var context,
    _curry = function(args) {
      return f.length > 1 ? function(){
        var params = args ? args.concat() : [];
        context = bound ? context || this : this;
        return params.push.apply(params, arguments) <
            f.length && arguments.length ?
          _curry.call(context, params) : f.apply(context, params);
      } : f;
    };
    return _curry();
  }
}).call(this);
