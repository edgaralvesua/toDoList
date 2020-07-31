//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//Database

mongoose.connect("mongodb+srv://admin-edgar:melancia0102-@cluster0.dnu55.mongodb.net/todolistDB", {useNewUrlParser:true, useUnifiedTopology: true })

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({
  name:"Arrumar o quarto"
});

const item2 = new Item({
  name:"Arrumar a cozinha"
});

const item3 = new Item({
  name:"Arrumar a casa de banho."
});

const defaultItems = [item1,item2,item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

//Express
app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems){
    if(foundItems.length === 0){

      Item.insertMany(defaultItems, function(err){

        if(err){
          console.log(err);
        } else{
          console.log("Inserted with Sucess");
        };

      });

      res.redirect("/");

    } else {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    };
  });
});

app.get("/:field", function(req,res){
  const customListName = _.capitalize(req.params.field);

  List.findOne({name:customListName}, function(err,foundList){
    if (!err){
      if(!foundList){
        const list = new List({name:customListName, items: defaultItems});
        list.save();
        const url = "/" + customListName;
        res.redirect(url);
      } else{
        //Dar render
        res.render("list", {listTitle: foundList.name, newListItems:foundList.items });
      }
    }
  });
});

app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const listName = req.body.list;


  const addItem = new Item({name: itemName});


  if(listName === "Today"){
    addItem.save();
    console.log("Item Added");
    res.redirect("/");
  } else {
    List.findOne({name:listName}, function(err, foundList){
      foundList.items.push(addItem);
      foundList.save();
      res.redirect("/" + listName);
    });
  }

});

app.post("/delete", function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName==="Today"){
    Item.findByIdAndRemove(checkedItemId, function(err){
      if(err){
        console.log(err);
      } else{
        console.log("Item Removed");
      }
    });
    res.redirect("/");
  } else {
      List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList){
        if(!err){
          res.redirect("/"+listName);
        }
      });
  }
});



app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
