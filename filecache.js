/*
        Copyright (c) 2020 Archivist-Nerd
*/
'use strict';

const fs   = require('fs')
    , Mime = require('mime')
    , atob = ascii  => Buffer.from(ascii).toString('base64')
    , btoa = binary => Buffer.from(binary, 'base64') //.toString('binary')
    ;
/*
    File Cache Functions
*/
const FileCache = ()=>{
  let _Cache = {
        mimes: {},
        files: {},
      }
    , totalSize = 0
    ;
  function clear(){
    _Cache.mimes = {}
    _Cache.files = {}
    totalSize = 0
    return this
  }
  function list(){
    let result = []
    Object
      .keys( _Cache.files )
      .sort()
      .forEach( key=>result.push( key ) )
    return result
  }
  
  let getData = ( url='' )=>_Cache.files[url]
    , getMime = ( url='' )=>_Cache.mimes[ url.split('/').pop().split('.').pop() ]
    , getFile = ( url='' )=>({ data: getData(url), mime: getMime(url) })
    , bytes   = ()=>totalSize
    ;

  function add( url='', data='', mime=''){
    if ( typeof _Cache[url] !== 'undefined' ) totalSize -= _Cache.files[ url ].length
    _Cache.files[ url ] = data
    _Cache.mimes[ url.split('/').pop().split('.').pop().toLowerCase() ] = mime
    totalSize += data.length
    return this
  }

  function load( filename='', root='' ){
    if ( !filename.length) throw new Error('Blank Filename')
    if ( !fs.existsSync(filename) ) throw new Error(`Cache File "${filename}" does not exist`)

    let fileCache = JSON.parse( fs.readFileSync( filename, 'utf8' ) )
    // add mimes
    Object
      .keys( fileCache.mimes )
      .forEach( key=> _Cache.mimes[ key ] = fileCache.mimes[ key ] )
    // add files
    Object
      .keys( fileCache.files )
      .forEach( key=> _Cache.files[ key ] = fileCache.files[ root+key ] )
    return this
  }

  function save( filename='' ){
    if ( !filename.length) throw new Error('Blank Filename')
    let CacheSorted = {
      mimes: {},
      files: {},
    }
    // sort & add mimes
    Object.keys( _Cache.mimes ).sort().forEach( key=> CacheSorted.mimes[key] = _Cache.mimes[key] )
    // sort & add files
    Object.keys( _Cache.files ).sort().forEach( key=> CacheSorted.files[key] = atob( _Cache.files[key] ) )

    fs.writeFileSync( filename, JSON.stringify( CacheSorted, null, '\t' ) )

    return this
  }

  function pack( base='' ){
    if ( !base.length ) throw new Error('blank path')
    if ( !fs.existsSync(base) ) throw new Error(`Path "${base}" does not exist`)
    if ( base.substr(-1) === '/' ) base = base.substr(0, base.length-1 )

    const walk = function(dir='/') {
      let url   = (filename='')=>(`${dir}${filename}`).replace('//','/')
        , path  = (filename='')=>(`${base}${dir}${filename}`).replace('//','/')
        , readFile  = (filename='')=> fs.readFileSync( path( filename ) )
        , files = fs.readdirSync( path() )
        ;
      if ( dir.substr(-1) !== '/' ) dir += '/'
      if ( fs.existsSync( path('index.html' ) ) ) add( dir, readFile('index.html'), 'text/html' )

      files.forEach( (file)=>{
        var stat = fs.statSync( path(file) )
        if ( stat && stat.isDirectory() )            /* Recurse into a subdirectory */
          walk( url(file) );
        else                                         /* Is a file */
          add( url(file), readFile( file ), Mime.getType(file) )
        ;
      })
    }
    walk()
    return this
  }

  function unpack( path='' ){
    const mkFolder = (_path='', path=_path.replace('//','/')) => {
      if ( fs.existsSync( path ) ) return
      mkFolder( path.split('/').slice(0,-1).join('/') )
      if ( !fs.existsSync( path ) ) fs.mkdirSync( path )
    }
    /*
      Process all files
    */
    Object.keys( _Cache.files ).forEach( key=> {
      let folders  = key.split('/')
        , filename = (folders.slice(-1)[0] !=='') ? folders.pop():'index.html'
        , filedata = btoa( _Cache.files[ key ] )
        , fullpath = `${path}/${folders.join('/')}`
        ;
      // create path if not root
      mkFolder( fullpath )
      // write file
      fs.writeFileSync( `${fullpath}/${filename}`, filedata )
    })
    return this
  }

  return {
    data:_Cache,
    clear,
    getFile,
    getData,
    getMime,
    bytes,
    list,
    add,
    load,
    save,
    pack,
    unpack,
  }
}

module.exports = FileCache;