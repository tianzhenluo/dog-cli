const request = require('request')
const cheerio = require('cheerio')
const fs = require('fs')
const { resolve } = require('path')
let searchAPI = 'https://www.manbaifen.com/search/?keywords='
let search =  {

    wordSearch: async function(keyword) {
        keyword = encodeURIComponent(keyword)
        return new Promise((resolve, reject) => {
            request(searchAPI + keyword, (err, res, body) => {
                if (err) { console.warn('搜索错误', err); return }
                if (res.statusCode === 503) {
                    console.log(`搜索 -- ${keyword} --`, '请求状态： ', res.statusCode)
                    return
                }
                let $ = cheerio.load(body)
                let searchList = $('#contList .item-lg')
                if (searchList.length === 0) {
                    // 检索关键词为空
                    resolve([])
                } else {
                    let list = Array.from(searchList)
                    let result = list.map((item, index) => {
                        const Atag = searchList.eq(index).find('.cover')
                        return {
                            href: Atag.attr('href'),
                            title: Atag.attr('title'),
                            update: searchList.eq(index).find('.updateon').text()
                        }
                    })
                    search.searchJson(keyword, result).then(() => {
                        resolve(result)
                    })
                }
            })
        })
    },

    searchJson(keyword, searchResult) {
        return new Promise((resolve, reject) => {
            let d = {
                title: keyword,
                result: searchResult
            }
            fs.writeFile('search.json', JSON.stringify(d), 'utf8', () => {
                console.log('成功写入search.json')
                resolve()
            })
        })
    }
}

module.exports = search