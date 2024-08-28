const axios = require('axios').default

const userService = require('./userService')
const {userModel} = require('./../models');
const config = require('../../config');

let googleLoginService = {};

googleLoginService.getAccessToken = async (data)=>{
   let responce =  await axios.post(`https://oauth2.googleapis.com/token`,{},{headers:{"Content-Type": "application/x-www-form-urlencoded"},params:{...data,"client_id":config.GOOGLE.CLIENT_ID,"client_secret":config.GOOGLE.CLIENT_SECRET,'grant_type':'authorization_code'}});
   responce = await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${responce.data.access_token}`);
   let user = await userService.getUser({email:responce.data.email},{})
   let obj = {email:responce.data.email,isVerify:true,firstName:responce.data.given_name,lastName:responce.data.family_name}
   Object.keys(obj).forEach(key=>{
      if(!obj[key]){
        delete obj[key];
      }
    })   
  if(user){
    return await userService.updateUser({email:responce.data.email},obj);
  }else{
    console.log('------->>',obj);
   return await userModel(obj).save();
  }
}


googleLoginService.getVoiceList = async(filter='en')=>{
  let data =  await axios.get(`https://texttospeech.googleapis.com/v1/voices?languageCode=${filter}&key=${process.env.GOOGLE_API_KEY}`);
  console.log(data.data);
  return data.data
}

module.exports = googleLoginService;
