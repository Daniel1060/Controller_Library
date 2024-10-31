express = require('express');
const session = require('express-session'); //npm install express-session
var app = express();
const bodyParser = require('body-parser');



app.use(bodyParser.urlencoded({
    extended: true
}))

app.use(bodyParser.json());

// set up mongoDB
const MongoClient = require('mongodb-legacy').MongoClient;
const url = 'mongodb://127.0.0.1:27017';
const client = new MongoClient(url);
// DB for userdata and controller data
const dbname = 'webDB';


app.use(function(req, res, next) {
    res.locals.session = req.session;
    next();
});


// code to define the public "static" folder
app.use(express.static('public'))

//this tells express we are using sesssions. These are variables that only belong to one user of the site at a time.
app.use(session({
    //CHANGE SECRET LATER
    secret: 'Basic Secret',
    resave: false,
    saveUninitialized: true
}));

// set the view engine to ejs
app.set('view engine','ejs');



// Setup for future user login's if needed
const userInitializer = function(req, res, next){
    if(req.session.userData === undefined){
        console.log("Create user data!");
        req.session.userData = {
                loggedIn:false,
                accountInfo:{
                    username:"",
                    email:"",
                    password:"",
                    dob:"",
                    gender:"",
                    dateRegistered:""
                }
            }
    console.log(req.session.userData);
    }
    next();
}

function getDateTime(){
    var currentdate = new Date(); 
    var datetime = currentdate.getDate() + "/"
                + (currentdate.getMonth()+1)  + "/" 
                + currentdate.getFullYear() + " @ "  
                + currentdate.getHours() + ":"  
                + currentdate.getMinutes() + ":" 
                + currentdate.getSeconds();
    return datetime;
}

app.use(userInitializer);

connectDB();
//this is our connection to the mongo db, ts sets the variable db as our database
async function connectDB() {
    // Use connect method to connect to the server
    await client.connect();
    console.log('Connected successfully to server');
    db = client.db(dbname);

    // // check if necessary collections exist
    // checkCollections('profiles');
    // checkCollections('characters');

// app.set(){
//     var session.loggedIn=false;
//     var session.userData =
}

// ****** Routes 




// Direct user to index page
app.get('/', function(req, res){
    res.render('pages/index', {loggedIn: req.session.userData.loggedIn});
});



app.get('/about', function(req, res){
    res.render('pages/about',{loggedIn: req.session.userData.loggedIn});
});



app.get('/admin', function(req, res){
    if(req.session.userData.loggedIn===true){
        res.render('pages/admin',{loggedIn: req.session.userData.loggedIn, userData:req.session.userData})
    }else{
        res.render('pages/login',{loggedIn: req.session.userData.loggedIn})
    }
});

// These are created for future use if necessary

// app.get('/create-account', function(req, res){
//     res.render('pages/createaccount',{loggedIn: req.session.userData.loggedIn});
// });

// app.get('/profile',function(req,res){
//     if(req.session.userData.loggedIn===true){
//         res.render('pages/profile',{loggedIn: req.session.userData.loggedIn, userData:req.session.userData})
//     }else{
//         res.render('pages/login',{loggedIn: req.session.userData.loggedIn})
//     }
// });


app.post('/create-new-account', function(req,res){
    // Add to check if sesion is logged in!!!

    var userData
    var userExists = false;
    if(req.body.password!=req.body.passwordconfirm){res.redirect('/create-account');return;}
    // db.collection('profiles').findOne({email: req.body.email})
    // .then(function(email){
    //     console.log(email	)
    //     if(!!email){
    //         userExists=true;
    //     }

    // })
    // db.collection('profiles').findOne({username: req.body.username});
    // .then(function(username){
    //     console.log(username)
    //     if(!!username){
    //         userExists=true;
    //     }
        
    // })console.log(email)

        // TODO HASH PASSWORD
        
        var newUserData = {
            "loggedIn":true,
            "accountInfo":{
                "username":req.body.username,
                "email":req.body.email,
                "password":req.body.password,
                "dob":"",
                "gender":"",
                "dateRegistered":getDateTime()
            }
        }

        req.session.userData=newUserData;
        db.collection('profiles').insertOne(req.session.userData.accountInfo, function(err, result){
            if(err)throw err;
            console.log('New user saved to DB')
            res.redirect('/')
        })
    
});

app.post('/loginuser', function(req, res) {
    var uname = req.body.username;
    var pword = req.body.password;

    console.log(uname + " " + pword);

    db.collection('profiles').findOne({"username": uname}, function(err, result) {
        if (err) throw err;

        console.log(result);
      
      if (!result) {
            res.redirect('/login');
            return;
        }

        if (result.password === pword) {
            req.session.userData={
                "loggedIn":true,
                "accountInfo":{
                    "username":result.username,
                    "email":result.email,
                    "password":result.password,
                    "dob":"",
                    "gender":"",
                    "dateRegistered":result.dateRegistered
                }
            }
            console.log("User logged in")
            res.redirect('profile');
        } else {
            // var errormessage = "Wronger username or password"
            console.log("wrong username or password!")
            res.redirect('login');
        }
    });
});
      
      
      


app.listen(8080);

//-------------------- POST ROUTES -------------------------

app.post('/addcontroller', function(req, res) {
    req.session.character.race = req.body.race;
    req.session.character.subrace = undefined;

    res.sendStatus(200);
});



//-------------------- GET ROUTES -------------------------
// This can be used for API access in the future

app.get('/getCharacterClass', function(req, res) {
    res.send(req.session.character.classes);
});