/*
        Copyright (c) 2020 Archivist-Nerd
*/
'use strict';

const fs        = require('fs')
    , fileCache = require('../.')
    , out       = (msg)=>process.stdout.write(`${msg}\n`)
    ;

console.log('Testing filecache')

let tests = [
  ['unpack: jsbeeb.min', ()=>{
    let cache = fileCache()
                  .load  ( './jsbeeb.min.json' )
                  .unpack( './test.unpacked'   )
    return { success: fs.existsSync( './test.unpacked/ddnoise.js' ) }
  }],
  ['pack: ./test.unpacked', ()=>{
    let cache = fileCache()
                  .pack( './test.unpacked'   )
                  .save( './jsbeeb.min.packed.json' )
    return { files: cache.list().length, bytes: cache.bytes() }
  }],
  ['unpack: jsbeeb.min.packed', ()=>{
    let cache = fileCache()
                  .load  ( './jsbeeb.min.packed.json' )
                  .unpack( './test.unpacked2'   )
    return { success: fs.existsSync( './test.unpacked/ddnoise.js' ) }
  }],
  ['compare: jsbeeb.min vs jsbeeb.min.packed', ()=>{
    let file1 = fileCache().load( './jsbeeb.min.json' )
      , file2 = fileCache().load( './jsbeeb.min.packed.json' )
      , diffs = []
      ;
    Object.keys(file2.data).sort().forEach( key=>{
      let f1 = file1.data[key]
        , f2 = file2.data[key]
      if (typeof f1 == 'object' && typeof f2 == 'object'){
        let difMime = (f1.mime != f2.mime)
          , difData = (f2.data.length - f1.data.length)
          ;
        if (difMime || difData) diffs.push([key,difData,difMime, f1.mime, f2.mime])
      } else {
        diffs.push([key,typeof f1, typeof f2])
      }
    })
    return { diffs }
  }],
]

tests.forEach( test=>{
  console.log( test[0], test[1]() )
})