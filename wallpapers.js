const https = require('https')
const jsdom = require("jsdom")
const fs = require('fs')

// example link                                                     v Category name
// https://wall.alphacoders.com/by_sub_category.php?id=344100&name=Tokyo+Revengers+Wallpapers
//                                                      ^ categoryID
const categoryId = '344100'
const categoryName = 'Tokyo+Revengers+Wallpapers'
const maxPageNb = 6
const outputFolder = './tokyorevengers_output'
const filePrefix = 'bg_'

for(let pageNb = 1; pageNb < maxPageNb; ++pageNb) { // For each page

    const optionsGetBgInfo = { // Options to scrap all informations about the bg
        hostname: 'wall.alphacoders.com',
        port: 443,
        path: `/by_sub_category.php?id=${categoryId}&name=${categoryName}&page=${pageNb}`,
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
            const dom = new jsdom.JSDOM(response)
            const downloadBtns = dom.window.document.querySelectorAll('.download-button') // get the download buttons
            downloadBtns.forEach(dlb => {
                let data = dlb.dataset
                // DOWNLOAD LINK : https://initiate.alphacoders.com/download/wallpaper/${id}/${server}/${format}/
                const optionsDownload = {
                    hostname: 'initiate.alphacoders.com',
                    port: 443,
                    path: `/download/wallpaper/${data.id}/${data.server}/${data.type}`,
                    method: 'GET'
                }
                const reqDownload = https.request(optionsDownload, resDownload => {
                    if(!fs.existsSync(outputFolder)) {
                        console.log(`Output folder not found, creating it...`)
                        fs.mkdirSync(outputFolder)
                    }
                    const file = fs.createWriteStream(`${outputFolder}/${filePrefix}${data.id}.${data.type}`);
                    console.log(`Starting download of ${data.id}.${data.type}`)
                    resDownload.on('data', chunk => {
                        file.write(chunk)
                    })
                    resDownload.on('end', () => {
                        file.close()
                        console.log(`${data.id}.${data.type} downloaded!`)
                    })
                })
                reqDownload.on('error', err => {console.error(`Error while downloading ${data.id}.${data.type}, error: ${err}`)})
                reqDownload.end()
            })
        })
    })

    reqGetPage.on('error', error => { // If error on
        console.error(`Error while fetching download links, error: ${error}`)
    })

    reqGetPage.end()
}


