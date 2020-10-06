/*
        Copyright (c) 2020 Archivist-Nerd
*/
'use strict';

const fs        = require('fs')
    , fileCache = require('.')
    , out       = (msg)=>process.stdout.write(`${msg}\n`)
    , filename  = '../test.filecache.cache.json'
    ;

out(`Test filecache (node:Package)\n`)
/*
      Single File Test
*/
let oneFile = fileCache()
                .add('/','Test File','test/mime')
console.log('test: oneFile', { url: '/', file:oneFile.getFile('/'), mime:oneFile.getMime('/'), data:oneFile.getData('/') } )
/*
      Pack local file test
*/
let cacheFile = fileCache()
                  .pack('./')
console.log('test: cacheFile', { files: cacheFile.list().length, bytes: cacheFile.bytes() } )
/*
      Save Cache File
*/
cacheFile.save( filename )
console.log('test: saveCacheFile', { success: fs.existsSync( filename ) } )
/*
      Load Cache File
*/
let newCacheFile = fileCache()
                      .load( filename )
console.log('test: loadCacheFile', { files: cacheFile.list().length, bytes: cacheFile.bytes() } )
/*
      unpack Cache File
*/
newCacheFile.unpack('./test.unpacked')
console.log('test: unpackCacheFile', { success: fs.existsSync( './test.unpacked/package.json' ) } )


out('done.')