const https = require('https')
const jsdom = require("jsdom")
const fs = require('fs')
const {downloadRequest} = require('./scrapping-functions.js')

// example link
// https://mobile.alphacoders.com/by-sub-category/344100
//                                                ^ categoryID
const categoryId = '344100'
const maxPageNb = 4
const outputFolder = './tokyorevengers_output'
const filePrefix = 'mbg_'

for(let pageNb = 1; pageNb <= maxPageNb; ++pageNb) { // For each page

    const optionsGetBgInfo = { // Options to scrap all informations about the bg
        hostname: 'mobile.alphacoders.com',
        port: 443,
        path: `/by-sub-category/${categoryId}?page=${pageNb}`,
        method: 'GET'
    }

    let response = ''
    const reqGetPage = https.request(optionsGetBgInfo, res => { // Create request and get the page
        console.log(`Starting fetching of page n°${pageNb}`)
        res.on('data', d => {
            response += d
        })
        res.on('end', () => {
            console.log(`Fetched page n°${pageNb}`)
            if(!fs.existsSync(outputFolder)) {
                console.log(`Output folder not found, creating it...`)
                fs.mkdirSync(outputFolder)
            }
            const dom = new jsdom.JSDOM(response)
            const imageElements = dom.window.document.querySelectorAll('.img-responsive') // get  all the images
            const images = []
            imageElements.forEach(im => {
                let idAndType = im.src.substr(im.src.lastIndexOf('/thumb-')+'/thumb-'.length).split('.')
                images.push({id: idAndType[0], type: idAndType[1]})
            })
            images.forEach(image => {
                // link: https://initiate.alphacoders.com/download/mobile-wallpaper/933879/jpg
                const optionsDownload = {
                    hostname: 'initiate.alphacoders.com',
                    port: 443,
                    path: `/download/mobile-wallpaper/${image.id}/${image.type}`,
                    method: 'GET'
                }
                downloadRequest(optionsDownload, outputFolder, filePrefix, image.id, image.type)
            })
        })
    })

    reqGetPage.on('error', error => { // If error on
        console.error(`Error while fetching download links, error: ${error}`)
    })

    reqGetPage.end()
}


