const express = require("express");
const bodyParser=require("body-parser");
const mongoose = require("mongoose");
const { request } = require("express");
const app=express();

app.set('view engine','ejs');

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

//connection with the DB
mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true});

// Items schema
const itemSchema= {
    name: String
};

// model
const Item=mongoose.model("Item",itemSchema);

const item1 = new Item({
    name: "Welcome to your todolist!"
});

const item2 = new Item({
    name: "Hit the + button to add a new item."
});

const item3 = new Item({
    name: "<-- Hit this to delete an item."
});

const defaultItems=[item1,item2,item3];

// rendering default page.
app.get("/",function(req,res){

    Item.find()
    .then(function(foundItems){

        //  inserting initial elements on conditional basis
        if (foundItems.length===0){
            Item.insertMany(defaultItems)
            .then(function(){
                console.log("Successfully saved default items to DB");
            })
            .catch(function(){
                console.log(err);
            });
            res.redirect("/"); // for revisiting the page.
        }
        else{
            res.render("list",{ListTitle:"Today",newListItems: foundItems});          
        }

    })
    .catch(function(foundItems){
        console.log(err);
    })
});                

// Postng the "/" page
app.post("/",function(req,res){
    const itemName = req.body.newItem;
    const item = new Item({
        name: itemName
    });
    item.save();
    res.redirect("/");
});

// Deleting the item after checking it out
app.post("/delete", function(req, res){
    const checkedItemId = req.body.checkbox;

    Item.findByIdAndRemove(checkedItemId)
    .then(function(){
        console.log("Successfully deleted checked item");
        res.redirect("/");
    })
    .catch(function(){
        console.log(err);
    })
});

// app.get("/work",function(req,res){
//     res.render("list",{ListTitle:"Work List", newListItems:workItems});
// });
// });

// app.get("/about",function(req,res){
//     res.render("about");
// });

app.listen(3000,function(){
    console.log("Server started on port 3000");
});