const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require('lodash');

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://chetanandroid:Shivi123@todo.jlwlu.mongodb.net/todoListDB", {useNewUrlParser: true, useUnifiedTopology:true})

const itemSchema = mongoose.Schema({
	item: String
})

const listSchema = mongoose.Schema({
	list: String,
	items: [itemSchema]
})

const Item = mongoose.model("Item", itemSchema)
const List = mongoose.model("list", listSchema)

const item1 = new Item(
	{
		item: "Shopping"
	})

const defaultList = [item1]	

app.get('/', (req,res) => {
	Item.find({}, function(err, items){
		if(items.length === 0){
			Item.insertMany(defaultList, (err)=>{
			if(!err){
				console.log("Data was submitted successfully!!")
			}})
			res.redirect('/');

		} else {
			res.render("index" ,{title: "Today List", newItem: items});
		}
	})
})

app.post('/', (req,res) => {
	let itemName = req.body.itemName;
	let listName = req.body.btn;

	const item = new Item({
		item: itemName
	})

	if(listName === "Today List"){
		item.save();
		res.redirect('/')	
	} else {
		List.findOne({list: listName}, function(err, ListFound){
			ListFound.items.push(item)
			ListFound.save();
			res.redirect("/"+listName)
		})
	}
})

app.post('/delete',function(req, res){
	const ItemBox = req.body.checkbox;
	const itemList = req.body.listName;
	
	if(itemList === "Today List"){
		Item.findByIdAndRemove(ItemBox, function(err){
			if(!err){
				res.redirect("/")
			}
		})

	}else {
		List.findOneAndUpdate({list: itemList}, {$pull: {items: {_id: ItemBox}}}, function(err, updateList){
			if(!err){ 
				res.redirect("/" + itemList);
			}
		});
	}
})

app.get('/:name', (req, res)=> {
	const ListName = _.capitalize(req.params.name)
	
	List.findOne({list: ListName},function(err, lists){
		if(!err){
			if(!lists){
				const list = new List({
					list: ListName,
					items: defaultList
				})
				list.save();	
				res.redirect("/" + ListName)
			} else {
				res.render("index", {title: ListName, newItem: lists.items});
			}
		}
	})
})

app.listen(process.env.PORT || 3000 , () => {
	console.log("Server up and running on PORT 3000")
})
