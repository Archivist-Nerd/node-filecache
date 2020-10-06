/*
        Copyright (c) 2020 Archivist-Nerd
*/
'use strict';

const fs   = require('fs')
    , Mime = require('mime')
    ;
/*
    File Cache Functions
*/
const FileCache = ()=>{
  const atob = ascii  => Buffer.from(ascii).toString('base64')
      , btoa = binary => Buffer.from(binary, 'base64') //.toString('binary')
      ;
  let _Cache = {}
    , totalSize = 0

  function clear(){
    _Cache = {}
    totalSize = 0
    return this
  }
  function list(){
    let result = []
    Object
      .keys( _Cache )
      .sort()
      .forEach( key=>result.push( key ) )
    return result
  }
  
  function getFile( url='' ){
    return _Cache[url]
  }
  function getData( url='' ){
    return _Cache[url]? _Cache[url].data:undefined
  }
  function getMime( url='' ){
    return _Cache[url]? _Cache[url].mime:''
  }

  function add( url='', data='', mime=''){
    if ( typeof _Cache[url] !== 'undefined' ) totalSize -= _Cache[url].data.length
    _Cache [ url ] = {
      data: data,
      mime: mime,
    }
    totalSize += data.length
    return this
  }

  function bytes(){
    return totalSize
  }

  function load( filename='' ){
    if ( !filename.length) throw new Error('Blank Filename')
    if ( !fs.existsSync(filename) ) throw new Error(`Cache File "${filename}" does not exist`)

    let fileCache = JSON.parse( fs.readFileSync( filename, 'utf8' ) )

    console.log(`loaded: Cache File "${filename}" \t ${ Object.keys( fileCache ).length } files`)

    Object
      .keys( fileCache )
      .forEach( key=>{
        let file = fileCache[ key ]
        add( key, btoa( file.data ), file.mime )
      })
    return this
  }

  function save( filename='' ){
    if ( !filename.length) throw new Error('Blank Filename')

    let CacheSorted = {}
    Object.keys( _Cache ).sort().forEach( key=> {
      CacheSorted[ key ] = _Cache[ key ]
      CacheSorted[ key ].data = atob( _Cache[ key ].data )
    })

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
    Object.keys( _Cache ).forEach( key=> {
      let folders  = key.split('/')
        , filename = (folders.slice(-1)[0] !=='') ? folders.pop():'index.html'
        , filedata = btoa( _Cache[ key ].data )
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