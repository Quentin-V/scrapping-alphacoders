const https = require('https')
const jsdom = require("jsdom")
const fs = require('fs')
const {downloadRequest, getMaxPage} = require('./scrapping-functions.js')
const config = require('./config.js')

// example link                                v Category id
// https://art.alphacoders.com/by_sub_category/344100

const categoryId = config.categoryId
const outputFolder = config.outputFolder
const filePrefix = config.filePrefixMobileWp
const collOrCat = config.collectionOrCategory

let fileCount, tot
fileCount = tot = 0

const optionsMaxPage = {
    hostname: 'art.alphacoders.com',
    port: 443,
    path: `/by_${collOrCat}/${categoryId}`,
    method: 'GET'
};

(async () => {
    const maxPageNb = await getMaxPage(optionsMaxPage)
    console.log(`Found ${maxPageNb} pages, fetching started`)
    for(let pageNb = 1; pageNb <= maxPageNb; ++pageNb) { // For each page

        const optionsGetBgInfo = { // Options to scrap all informations about the bg
            hostname: 'art.alphacoders.com',
            port: 443,
            path: `/by_${collOrCat}/${categoryId}?page=${pageNb}`,
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
                const downloadBtns = dom.window.document.querySelectorAll('.download-button') // get the download buttons
                tot += downloadBtns.length
                console.log(`Sending download requests for page n°${pageNb}`)
                downloadBtns.forEach(dlb => {
                    let data = dlb.dataset
                    if(fs.existsSync(`${outputFolder}/${filePrefix}${data.id}.${data.type}`)) {
                        console.log(`File ${filePrefix}${data.id}.${data.type} already exists, skipping...`)
                        return;
                    }
                    // link: "https://initiate.alphacoders.com/download/art/144192/jpg/171077400540096"
                    const optionsDownload = {
                        hostname: 'initiate.alphacoders.com',
                        port: 443,
                        path: `/download/art/${data.id}/${data.type}`,
                        method: 'GET'
                    }
                    downloadRequest(optionsDownload, outputFolder, filePrefix, data.id, data.type, ++fileCount, tot)
                })
            })
        })

        reqGetPage.on('error', error => { // If error on
            console.error(`Error while fetching download links, error: ${error}`)
        })

        reqGetPage.end()
    }
})()


