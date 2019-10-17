var express = require("express");
var router = express.Router();
var TodoList = require("../models/todos");
var user = require("../models/user");
var auth = require("../middleware/auth");

//show all todos
router.get("/", function(req, res) {
    var perPage = 10;
	var pageQuery = parseInt(req.query.page);
	var pageNumber = pageQuery ? pageQuery : 1;
	
    TodoList.find({}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function(err, allTodoList){
        TodoList.countDocuments().exec(function(err, count) {
            if (err) {
                console.log(err.message);
            } else {
                res.render("dashboard/todolist", {
                    todolists: allTodoList,
                    current: pageNumber,
                    pages: Math.ceil(count / perPage)
                });

                // res.send(allTodoList);
            }
        });
    });
});

//create new todolist to the db
router.post("/add", function(req, res) {
    var taskDescription = req.body.taskDescription;
    var taskDone = req.body.taskDone;

    var newTodoList = { taskDescription: taskDescription, taskDone: taskDone };

    TodoList.create(newTodoList, function(err, TodoList) {
        if (err) {
            console.log(err);
        } else {
            console.log(TodoList);
            res.redirect("/board");
        }
    });
});

//NEW - show form to create new todolist
router.get("/add", function(req, res){
    res.render("todolist/new"); 
 });
 
 //EDIT - show form to edit todolist
 router.get("/:id/edit", function(req, res) {
     TodoList.findById(req.params.id, function(err, foundTodoList){
         res.render("todolist/edit", {todolists: foundTodoList});
     });
 });
 
 //UPDATE - logic to edit todolist
 router.put("/:id", function(req, res) {
     //find and update the correct todolist
     TodoList.findByIdAndUpdate(req.params.id, {taskDescription: req.body.taskDescription, taskDone: req.body.taskDone}, {new: true}, function(err, foundTodoList) {
        if(err){
            console.log(err);
            res.redirect("/board");
        } else {
            console.log(foundTodoList);
            res.redirect("/todolist/" + req.params.id);
        }
     });
 });
 
 //destroy
 router.delete("/:id", function (req, res) {
     TodoList.findById(req.params.id, function (err, todolist) {
         if (err) {
             console.log(err);
             res.redirect("/board");
         } else {
             TodoList.remove({"_id": {$in: user.todolists}}, function(err) {
                if (err) {
                    console.log(err);
                    return res.redirect("/board");
                }
                todolist.remove();
                console.log("Todolist deleted successfully!");
                res.redirect("/board");
             });
         }
     });
 });
 
 module.exports = router;