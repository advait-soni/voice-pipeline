import express from 'express'
import 'dotenv/config'

const app = express()

const gemini_api_key = process.env.GEMINI_API_KEY

app.get('/', (req, res) => {
    res.send('Hello World')
})

app.listen(3000, () => {
    console.log('Server is running on port 3000')
    console.log("api key" , gemini_api_key)
    
})