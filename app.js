// IMPORTS
const express = require("express");
const bodyParser=require("body-parser");
const mongoose = require("mongoose");
const { request } = require("express");
const app=express();

app.set('view engine','ejs');

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));



//connection with the DB if not there this will create
mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true});

// Items schema
const itemSchema= {
    name: String
};

// model
const Item=mongoose.model("Item",itemSchema);


// default items
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
    .catch(function(err, foundItems){
        console.log(err);
    })
});                







const listSchema={
    name: String,
    items: [itemSchema]
};

const List=mongoose.model("List", listSchema);

// rendering new pages from the list that user wants so that user can maintain multiple lists.

app.get("/:customListName", function(req,res){

    const customListName=req.params.customListName;

    List.findOne({name:customListName})
    .then(function(err, foundList){
        if(!err){
            if(!foundList){
                // Create a new List
                const list = new List({
                    name: customListName,
                    items: defaultItems
                })
                list.save();
                res.redirect("/" + customListName, {ListTitle: customListName, newListItems: customListName.items} );
            }
            else{
                // Show an existing list
                res.render("list", {ListTitle: foundList.name, newListItems: foundList.items});
            }
        }
    })
    .catch(function(err, foundList){
        console.log(err);
    });

    
});







// Postng the "/"+ required page.
app.post("/",function(req,res){
    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    });

    if(listName === "Today"){
        item.save();
        res.redirect("/");    
    } 
    else{
        List.findOne({name: listName})
        .then(function(err, foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+ listName);
        })
        .catch(function(err, foundList){
            console.log(err);
        });
    }
});







// Deleting the item after checking it out
app.post("/delete", function(req, res){
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "Today") {
      Item.findByIdAndRemove(checkedItemId, function(err){
        if (!err) {
          console.log("Successfully deleted checked item.");
          res.redirect("/");
        }
      });
    } else {
      List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
        if (!err){
          res.redirect("/" + listName);
        }
      });
    }
});




// app.get("/work",function(req,res){
//     res.render("list",{ListTitle:"Work List", newListItems:workItems});
// });
// });

app.get("/about",function(req,res){
    res.render("about");
});

// starting server
app.listen(3000,function(){
    console.log("Server started on port 3000");
});