const request = require('request')
const cheerio = require('cheerio')
const Bagpipe = require('bagpipe')
const fs = require('fs')
const https = require('https')
let domain = 'https://www.manbaifen.com'
let imgHost = 'https://res.treesread.top'
let rootPath = ''
let urlArray = []
/**
 * 下载
 * @param {href} 下载地址
 * @param {title} 下载目录，自动创建 
 */
module.exports = function download({ href, title }) {
    rootPath = './' + title
    return new Promise((resolve, reject) => {
        mkdir(title)
            .then(() => {
                getChapter(href)
                    .then((data) => {
                        console.log(`检索 ${title}; 章节：`)
                        console.table(data)
                        console.log('开始下载...')
                        urlArray = data
                        loopLoad(urlArray)
                        resolve()
                    })
            })
            .catch(err => {
                console.log(err)
                reject()
            })
    })
}

// 全部章节处理
function loopLoad(urlArray) {
    for (let i = 0; i < urlArray.length; i++) {
        setTimeout(() => {
            downloadMiddle(urlArray[i])
        }, i * 10 * 1000); // 章节 下标值 * 10秒 后执行下一个章节下载；网速慢可以将10秒设大
    }
}

function downloadMiddle({ href, title }) {
    mkdir(rootPath + '/' + title).then(() => {
        request(domain + href, (err, res, body) => {
            if (err) { console.warn('资源不存在！！！================'); return }
            if (res.statusCode == 503) {
                console.log(page, ' 请求状态： ', res.statusCode)
                return
            }
            // let $ = cheerio.load(body)
            let reg = /\/upload\/(.*?)(jpg|png|jpeg|gif)/g
            let imgList = body.match(reg)
            if (!imgList) {
                return
            }
            console.log(title + '章节图片数量：', imgList.length)
            pageImgLength = imgList.length
            bpipe(imgList, title)
        })
    })
}


var downloadPic = function (src, dest, cb) {
    try {
        request(imgHost + src)
            .on('error', function (err) {
                console.log(src, '下载失败')
                cb()
            })
            .pipe(fs.createWriteStream(dest, { autoClose: true }))
            .on('error', function (err) {
                console.log(src, '下载失败')
                cb()
            })
            .on('finish', function () {
                console.log('pic saved!', imgHost + src)
                cb()
            })
    } catch (e) {
        console.log(e)
    }
}

let bagpipe = new Bagpipe(10)
function bpipe(imgList, title) {
    let length = imgList.length
    for (let i = 0; i < length; i++) {
        bagpipe.push(downloadPic, imgList[i], rootPath + '/' + title + '/' + i + '.jpg', (err, data) => {
            if (err) { console.warn(err) }
        })
    }
}

function mkdir(title) {
    return new Promise((resolve, reject) => {
        fs.mkdir('./' + title, (err) => {
            if (err) {
                console.log('创建文件夹', title, '失败')
                fs.promises.readdir('./' + title).then(files => {
                    if (files.length === 0) {
                        delDir('./' + title).then(() => {
                            fs.mkdir('./' + title, (err) => {
                                resolve()
                            })
                        })
                    }
                })
            } else {
                resolve()
            }
        })
    })
}

// 删除目录
function delDir(path) {
    return new Promise((resolve, reject) => {
        let files = [];
        if (fs.existsSync(path)) {
            files = fs.readdirSync(path);
            files.forEach((file, index) => {
                let curPath = path + "/" + file;
                if (fs.statSync(curPath).isDirectory()) {
                    delDir(curPath); //递归删除文件夹
                } else {
                    fs.unlinkSync(curPath); //删除文件
                }
            });
            console.log('删除-----', path)
            fs.rmdirSync(path);
            resolve()
        }
    })
}

function getChapter(href) {
    return new Promise((resolve, reject) => {
        request(domain + href, (err, res, body) => {
            if (err) { console.warn('资源不存在！！！================'); return }
            if (res.statusCode == 503) {
                console.log(page, ' 请求状态： ', res.statusCode)
                return
            }
            let $ = cheerio.load(body)
            let list = $('#chapter-list-1 li')
            let arrList = Array.from(list)
            arrList = arrList.map((item, index) => {
                let section = list.eq(index).find('a')
                return {
                    href: section.attr('href'),
                    title: section.find('span').text()
                }
            })
            resolve(arrList)
        })
    })
}

// let s = 'var chapterImages = ["/upload/20201119/5e8e9a799f138-800x1130.jpg","/upload/20201119/5e8e9a79bc011-800x1251.jpg","/upload/20201119/5e8e9a79d665a-800x1251.jpg","/upload/20201119/5e8e9a7a0d5d5-800x1251.jpg","/upload/20201119/5e8e9a7a30f02-800x1251.jpg","/upload/20201119/5e8e9a7a4ae39-800x1251.jpg","/upload/20201119/5e8e9a7a6aaf8-800x1251.jpg","/upload/20201119/5e8e9a7ac4323-800x1251.jpg","/upload/20201119/5e8e9a7ae4605-800x1251.jpg","/upload/20201119/5e8e9a7b0c843-800x1251.jpg","/upload/20201119/5e8e9a7b4a667-800x1251.jpg","/upload/20201119/5e8e9a7b74e91-800x1251.jpg","/upload/20201119/5e8e9a7b8e6bc-800x1251.jpg","/upload/20201119/5e8e9a7bae3bc-800x1251.jpg","/upload/20201119/5e8e9a7bcb922-800x1251.jpg","/upload/20201119/5e8e9a7c1f351-800x1251.jpg","/upload/20201119/5e8e9a7c3e25b-800x1251.jpg","/upload/20201119/5e8e9a7c6381a-800x1251.jpg","/upload/20201119/5e8e9a7c8281c-800x1251.jpg","/upload/20201119/5e8e9a7cac126-800x1251.jpg","/upload/20201119/5e8e9a7cccdf1-800x1251.jpg","/upload/20201119/5e8e9a7ce91e2-800x1251.jpg","/upload/20201119/5e8e9a7d175a0-800x1251.jpg","/upload/20201119/5e8e9a7d35927-800x1251.jpg","/upload/20201119/5e8e9a7d50c2f-800x1251.jpg","/upload/20201119/5e8e9a7d702cf-800x1251.jpg","/upload/20201119/5e8e9a7de22df-800x1251.jpg","/upload/20201119/5e8e9a7e0ca19-800x1141.jpg","/upload/20201119/5e8e9a7e2e34a-800x1141.jpg","/upload/20201119/5e8e9a7e75b05-800x1251.jpg","/upload/20201119/5e8e9a7e9227c-800x1251.jpg","/upload/20201119/5e8e9a7eae8fb-800x1251.jpg","/upload/20201119/5e8e9a7ec28ec-800x1130.jpg","/upload/20201119/5e8e9a7ed4edd-800x1250.jpg","/upload/20201119/5e8e9a7ee5c21-800x1130.jpg"];'

// let reg = /\/upload\/(.*?)(jpg|png|jpeg|gif)/g
// let res = s.match(reg)
// console.log(res)