#!/usr/bin/env node
const program = require('commander')
const fs = require('fs')
let {wordSearch, searchJson} = require('./script/search')
let cartoon = require('./script/download')
let searchResult = null
try {
    let res = fs.readFileSync('./search.json', 'utf-8')
    searchResult = JSON.parse(res)
} catch(e) {
    console.log('读取不到search.json')
    // console.log(e)
}

async function main() {
    program
        .command('search')
        .argument('<keyword>')
        .action(search)

    program
        .command('download')
        .argument('<subscript>')
        .action(download)

    await program.parseAsync(program.argv)
}

async function search(keyword) {
    console.log('dog run ...')

    wordSearch(keyword).then((res) => {
        global.searchResult = res
        console.warn(`检索 -- ${keyword} --，`, `检索到${res.length}条；`)
        console.table(res)

        console.log('使用dog-cli download subscript 进行下载；<subscript> 为检索表 index 字段')
    }).catch((err) => {
        console.err(err)
    })
}

async function download(sub) {
    let { href, title } = searchResult.result[sub]    
    if (!href || !title) {
        console.warn('输入的检索条目有误', sub, ' 找不到；或请先 search 关键词；获取搜索条目；')
        return
    }
    cartoon({ href, title })
        .then(() => {

        })
        .catch(err => {

        })
}

main()
