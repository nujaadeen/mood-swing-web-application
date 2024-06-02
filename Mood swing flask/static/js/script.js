import {auth,createUserWithEmailAndPassword,fetchNameFromDatabase,signInWithEmailAndPassword,saveNameToDatabase}  from './Db.js'

import { webalerts } from './uiAlert.js';

const register=document.getElementById('Register');
const app = document.getElementById('app');
const btn=document.getElementById('btn');
let Email=document.getElementById("Email");
let password=document.getElementById("Pass");

console.log(firebaseConfig);

function authenticate() {
  const clientId = 'fbf8d98118b146f98869ecb2c789015b';
  const redirectUri = encodeURIComponent('http://127.0.0.1:5000/dash');
  const scopes = 'user-read-private user-read-email'; // Add any necessary scopes
  
  window.location.href = `https://accounts.spotify.com/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes}&response_type=token`;
  }

let toggle=false;
let user_status=true; // login is shown to the page

register.addEventListener("click",toggle_forms);
btn.addEventListener("click",validate); 

const nameField = document.querySelector('.Name');
function toggle_forms(){
    if(!toggle){
      
        app.innerHTML="Register";
        btn.textContent="Sign Up";
        register.textContent="Login";
        toggle=true;
        user_status=false;
        nameField.style.display = 'flex';
        // console.log(Config.API_key);
        
    } else {
        app.innerHTML="Emotion-based Music Recommender";
        btn.textContent="Login";
        register.textContent="Register";
        toggle=false;
        user_status=true;
        nameField.style.display = 'None';
        
    }
}

function validate(){
    console.log("Click");
    console.log(user_status)
     let email=Email.value;
     let pass=password.value;
     console.log(email,pass);
     let name = document.getElementById('Name').value
       
    try {
        if(user_status){
            signInWithEmailAndPassword(auth, email, pass)
            .then(async (userCredential) => {
              // Signed in 
              const user = userCredential.user;
              console.log(user);
             
              localStorage.setItem("User_id",user.uid);
              webalerts.createAlert("success","Login successfull")
              fetchNameFromDatabase(user.uid);
              setTimeout(() => {
                 
                
                
                window.location.href="/dash";authenticate();
              }, 2000);
              
              
              
          
              Email.value="";
              password.value="";
              
              
             
            })
            .catch((error) => {
              const errorCode = error.code;
              const errorMessage = error.message;
              webalerts.createAlert("error","Canot get the user credentials")
              Email.value="";
              password.value="";
            });
        }
        if (user_status===false){
             console.log("sign Up")
             createUserWithEmailAndPassword(auth, email, pass)
             .then((userCredential) => {
               
               const user = userCredential.user;
               
               
                saveNameToDatabase(user.uid,name)
              console.log(user);
                setTimeout(() => {
                  webalerts.createAlert("success","Created Account Succesfully");
                  toggle_forms();
                }, 2000);
                Email.value=""
                password.value=""
                
                
                
                

             })
             .catch((error) => {
               const errorCode = error.code;
               const errorMessage = error.message;
               console.log(errorCode,errorMessage);
               alert("Error",errorCode,errorMessage);
               return
             });
             
        }
    } catch (error) {
        console.log("Error");
    }
}





