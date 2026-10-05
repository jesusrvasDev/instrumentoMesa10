import express from 'express'

const router=express.Router()


router.get('/',(req,resp)=>{
    resp.render('./Auth/login.pug')
})

export default router