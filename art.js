const https = require('https')
const jsdom = require("jsdom")
const fs = require('fs')
const {downloadRequest} = require('./scrapping-functions.js')

// example link                                v Category id
// https://art.alphacoders.com/by_sub_category/344100

const categoryId = '344100'
const maxPageNb = 1
const outputFolder = './tokyorevengers_output'
const filePrefix = 'art_'

for(let pageNb = 1; pageNb <= maxPageNb; ++pageNb) { // For each page

    const optionsGetBgInfo = { // Options to scrap all informations about the bg
        hostname: 'art.alphacoders.com',
        port: 443,
        path: `/by_sub_category/${categoryId}?page=${pageNb}`,
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
            downloadBtns.forEach(dlb => {
                let data = dlb.dataset
                // link: "https://initiate.alphacoders.com/download/art/144192/jpg/171077400540096"
                const optionsDownload = {
                    hostname: 'initiate.alphacoders.com',
                    port: 443,
                    path: `/download/art/${data.id}/${data.type}`,
                    method: 'GET'
                }
                downloadRequest(optionsDownload, outputFolder, filePrefix, data.id, data.type)
            })
        })
    })

    reqGetPage.on('error', error => { // If error on
        console.error(`Error while fetching download links, error: ${error}`)
    })

    reqGetPage.end()
}


