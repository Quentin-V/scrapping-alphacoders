# Alphacoders scrapping program
### This program will allow you to scrap data from [Alphacoders website](https://wall.alphacoders.com)
You can search for the art you want on the website and then download all pictures with the tools available here.

## Installation
* Execute `npm i` in your command console to install the dependencies
## Usage
* Change the constant values in the file
  * The category id that you find in the link of the website
  * The category name if needed also found in the link
  * The number of the last page, you can get it by adding `?page=99` or `&page=99` in the get parameters of the url. That number will be set back to the end page number automatically when loading the url
  * The output folder, the program will create it if it does not exist already
  * A prefix in the name of the files that will be generated
* Start the program with `node [program]`
* The program will automatically download everything in the folder you specified