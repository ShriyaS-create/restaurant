//calling all the packages
var express= require('express');
var app= express();
var port = process.env.PORT ||8000;
var bodyParser= require('body-parser');
var mongo= require('mongodb');
//helps connect to mongodb
var MongoClient= mongo.MongoClient
var mongourl = "mongodb+srv://admin:3012ranu@cluster0.e3pay.mongodb.net/database?retryWrites=true&w=majority";

var cors= require('cors');
const { query } = require('express');
var db;
//using cors
app.use(cors());
//using body parser
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json()
)
app.get('/health', (req,res)=> {
    res.send("Api is working")
})

//common
app.get('/',(req,res)=>{
    res.send(`<a href="http://localhost:8000/location" target="_blank">City</a> <br> <a href="http://localhost:8000/mealtype" target="_blank">MealType</a> <br> <a href="http://localhost:8000/restaurant" target="_blank">Restaurant</a> <br> <a href="http://localhost:8000/cuisine" target="_blank">Cuisines</a> <br> <a href="http://localhost:8000/order" target="_blank">Orders</a>`)
})

// for cities
app.get('/location',(req,res)=>{
    //var db is our database, go to collection city and find said data in form of array
    //without condition find
    db.collection('city').find({}).toArray((err, result)=>{
        if(err) throw err;
        res.send(result)
    })
})

//for mealtype
app.get('/mealtype',(req,res)=>{
    db.collection('mealtype').find({}).toArray((err,result)=>{
        if (err) throw err;
        res.send(result)
    })
})

//for restaurants restaurants on basis of city,mealtype and city and mealtype
app.get('/restaurant',(req,res)=>{
    var query={};
    if(req.query.city && req.query.mealtype){
        query={city:req.query.city,"type.mealtype":req.query.mealtype}
    }
    else if(req.query.city){
        query={city:req.query.city}
    }else if(req.query.mealtype){
        query={"type.mealtype":req.query.mealtype}
    }else{
        query={}
    }
    db.collection('restaurant').find(query).toArray((err, result)=>{
        if(err) throw err;
        res.send(result)
    })
})

//restaurant details
app.get('/restaurantdetails/:id',(req,res)=>{
    var query={_id:req.params.id}
    db.collection('restaurant').find(query).toArray((err,result)=>{
        if(err) throw err;
        res.send(result)
    })
})

//restaurants on basis of mealtype and cuisine
app.get('/restaurantlist/:mealtype',(req,res)=>{
    var condition ={};
    var sort={cost:1};
    if(req.query.cuisine){
        condition={"type.mealtype":req.params.mealtype, "Cuisine.cuisine":req.query.cuisine}
    }else if(req.query.city){
        condition={"type.mealtype":req.params.mealtype, city:query.city}
    }else if(req.query.lcost && req.query.hcost){
        condition={"type.mealtype":req.params.mealtype, cost:{$lt:Number(req.query.hcost), $gt:Number(req.query.lcost)}}
    }else if(req.query.sort){
        condition={"type.mealtype":req.params.mealtype}
        sort={cost:Number(req.query.sort)}
    }
    else{
        condition={"type.mealtype":req.params.mealtype}
    }
    db.collection('restaurant').find(condition).sort(sort).toArray((err, result)=>{
        if (err) throw err;
        res.send(result)
    })
})

//for cuisine
app.get('/cuisine',(req,res)=>{
    db.collection('cuisine').find({}).toArray((err,result)=>{
        if(err) throw err;
        res.send(result)
    })
})

//PlaceOrder
app.post('/placeorder',(req,res) => {
    console.log(req.body);
    db.collection('orders').insert(req.body,(err,result) => {
        if(err) throw err;
        res.send('posted')
    })
})

//order
app.get('/orders',(req,res) => {
    db.collection('orders').find({}).toArray((err,result) => {
        if(err) throw err;
        res.send(result)
    })
})

//connecting with mongodb
MongoClient.connect(mongourl,(err,connection) =>{
    if(err) throw err;
    db= connection.db('database')
    //making port listen
    app.listen(port, (err)=>{
        if(err) throw err;
        console.log(`Serve is running on port ${port}`)
    }) 
})
