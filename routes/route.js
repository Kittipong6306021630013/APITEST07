const express = require('express')
const router = express.Router()
//เรียกใช้งานโมเดล
const User = require('../models/user')
//hash password
const bcrypt = require('bcrypt')
//uploadimage 
const multer = require('multer')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/img/users')
    },
    filename: (req, file, cb) => {
        cb(null, 'file-' + Date.now() + '.' +
        file.originalname.split('.')[file.originalname.split('.').length-1])}
})
const upload = multer({ storage: storage })

//upload image and save in db
router.post('/upload',upload.single('ktb'),(req,res) => {
  console.log(req.file)
  const user_id = req.body.update_id
  const user = {
      image:req.file.filename
  }
  User.findByIdAndUpdate(user_id,user,{userFindAndModify:false}).exec(err=>{
        res.redirect('/elec_payment_ktb2')
  })
})

router.post('/upload-ktp',upload.single('ktp'),(req,res) => {
    console.log(req.file)
    const user_id = req.body.update_id
    const user = {
        image:req.file.filename
    }
    User.findByIdAndUpdate(user_id,user,{userFindAndModify:false}).exec(err=>{
        res.redirect('/elec_payment_ktp2')
    })
})

router.post('/upload-scb',upload.single('scb'),(req,res) => {
    console.log(req.file)
    const user_id = req.body.update_id
    const user = {
        image:req.file.filename
    }
    User.findByIdAndUpdate(user_id,user,{userFindAndModify:false}).exec(err=>{
        res.redirect('/elec_payment_scb2')
    })
})

//middleware
const isLoggedIn = (req, res, next) => {
    if (!req.session.user) {
    return res.redirect('/login');
    }
    next()
}

//index
router.get('/',isLoggedIn,(req,res)=>{
    res.render('index',{user:req.session.user})
})

//create user
router.post('/register', async (req, res) => {
    const {userID,password,name,elec_use,myroom,roomate,Status,image} = req.body
    const passwordHash = bcrypt.hashSync(password,10);
    const user = new User({
        userID, 
        password : passwordHash,
        name,
        myroom,
        elec_use,
        roomate,
        Status,
        image
    })
    
    try {
        const newUser = await user.save()
        res.status(201).json(newUser)
    }catch (err) {
        res.status(400).json({ message: err.message })
    }
})


//login
router.get('/login',(req,res)=>{
    res.render('login')
})


//login post
router.post('/login',async (req, res) => {
    const{userID,password} = req.body
    const user = await User.findOne({
        userID
    })
    if (user){
        const isCorrect = bcrypt.compareSync(password,user.password) 
        if(isCorrect){
            req.session.user = user
            return res.render('index',{user})
        }else{
            return res.render('login')
        }
    }else{
        return res.render('login')
    }
})


router.get('/dbuser',(req,res) => {
    User.find().exec((err,user)=>{
        res.render('datauser',{user:user})
    })   
})

router.post('/update-status',(req,res)=>{
    const updateID = req.body.update
    const user = {Status:true}
    User.findByIdAndUpdate(updateID,user,{userFindAndModify:false}).exec(err=>{
        res.redirect('/dbuser')
    })
})

router.post('/reset-status',(req,res)=>{
    const user = {
        Status:false,
        image:""
    }
    User.updateMany(user).exec(err=>{
        res.redirect('/dbuser')
    })
})

router.get('/repass',(req,res)=>{
    res.render('repassword')
})

router.post('/repass',async (req,res) => {
    const email = req.body.email
    const user = await User.findOne({
        userID : email
    })
    if(user){ 
        req.user = user
        return res.render('repassword-end',{user})
    }else{
        return res.render('repassword')
    }
})


router.get('/repass-end',(req,res)=>{
    res.render('repassword-end')

})

router.post('/repass-end',async (req,res) => {
    const password = req.body.password
    const repass = req.body.new_password
    const repass1 = req.body.new_password1
    const Updatepass = await User.findOne({
        _id : req.body.update_id
    })
    const isCorrect = bcrypt.compareSync(password,Updatepass.password) 
    if(isCorrect){
        if(repass == repass1){
            const passwordHash = bcrypt.hashSync(repass,10)
            
            User.findByIdAndUpdate(Updatepass,{password:passwordHash},{userFindAndModify:false}).exec(err=>{
                res.redirect('/repass-sucess')
            })
        
        }else{
            console.log("password not same")
            res.render('repassword-end',{user:Updatepass._id})
        }
    }else{
        console.log("Password inccorrect")
        res.render('repassword-end',{user:Updatepass._id})
    }
   
})

router.get('/repass-sucess',(req,res)=>{
    res.render('repassword-sucess')
})

router.get('/navbar',(req,res)=>{
    res.render('navbar',{user:req.session.user})
})

//views  
router.get('/elec_bills',isLoggedIn,(req,res)=>{
    res.render('elec-bills',{user:req.session.user})
})

router.get('/elec_payment',isLoggedIn,(req,res)=>{
    res.render('elec-payment',{user:req.session.user})
})

router.get('/elec_payment_ktb',isLoggedIn,(req,res)=>{
    res.render('elec-bills_krungthai',{user:req.session.user})
})

router.get('/elec_payment_ktb1',isLoggedIn,(req,res)=>{
    res.render('elec-bills_krungthai_1',{user:req.session.user})
})


router.get('/elec_payment_ktb2',isLoggedIn,(req,res)=>{
    res.render('elec-bills_krungthai_2',{user:req.session.user})
})

router.get('/elec_payment_ktp',isLoggedIn,(req,res)=>{
    res.render('elec-bills_krungthep',{user:req.session.user})
})

router.get('/elec_payment_ktp1',isLoggedIn,(req,res)=>{
    res.render('elec-bills_krungthep_1',{user:req.session.user})
})

router.get('/elec_payment_ktp2',isLoggedIn,(req,res)=>{
    res.render('elec-bills_krungthep_2',{user:req.session.user})
})

router.get('/elec_payment_scb',isLoggedIn,(req,res)=>{
    res.render('elec-bills_thaipanich',{user:req.session.user})
})

router.get('/elec_payment_scb1',isLoggedIn,(req,res)=>{
    res.render('elec-bills_thaipanich_1',{user:req.session.user})
})

router.get('/elec_payment_scb2',isLoggedIn,(req,res)=>{
    res.render('elec-bills_thaipanich_2',{user:req.session.user})
})

router.get('/logout',(req,res)=>{
    req.session = null
    res.redirect('/login')
})

module.exports = router