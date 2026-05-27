const express = require("express")
const cors = require("cors")
const axios = require("axios")
const bcrypt = require("bcrypt")
require("dotenv").config()



const app = express()
const PORT = process.env.PORT || 5000
let users = []

app.use(cors())

app.use(express.json())
app.post("/api/register",async (req,res)=>{

  try{

  const {username , password } = req.body;

  const existsuser = users.find((usernames)=>usernames.username == username)

  if(existsuser){
    return res.status(400).json({ msg:"already username exists"})
  }
  
  const hashedPassword = await bcrypt.hash(password,10)

  const newuser = {
    username,
    password:hashedPassword
  }

  users.push(newuser)

  return res.status(201).json({msg:"created successfully"})
  }

  catch(err){
        return res.status(500).json({msg:"errro ocuured"})
  }
})
app.get("/api/users", (req,res)=>{

  return res.status(200).json({users})


})
app.post("/api/login", async (req, res) => {

  try {

    const { username, password } = req.body;

    // find user
    const existsuser = users.find(
      (usernames) => usernames.username == username
    )

    // username check
    if (!existsuser) {
      return res.status(400).json({
        msg: "username not found"
      })
    }

    // compare password
    const isMatch = await bcrypt.compare(
      password,
      existsuser.password
    )

    if (!isMatch) {
      return res.status(400).json({
        error: "Invalid password!"
      })
    }

    // success login
    res.status(200).json({
      message: "Login successful!",
      user: {
        username: existsuser.username
      }
    })
  } 
  
  catch (error) {

    res.status(500).json({
      error: "Server error during login."
    })
  }
  })
app.listen(PORT,()=>{
  console.log(`server is running on port ${PORT}`)
})