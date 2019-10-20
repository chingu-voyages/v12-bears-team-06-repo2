var express = require("express");
var router = express.Router();
var TodoList = require("../models/todos");
var User = require("../models/user");
var auth = require("../middleware/auth");

//show all todos
router.get("/", auth, function(req, res) {
    var perPage = 10;
	var pageQuery = parseInt(req.query.page);
	var pageNumber = pageQuery ? pageQuery : 1;
    
    
    TodoList.find({}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function(err, allTodoList){
        TodoList.countDocuments().exec(function(err, count) {
            if (err) {
                console.log(err.message);
            } else {
                // if(req.user._id === ) {
                    res.send(allTodoList);
                // } else {
                    // res.send("empty");
                // }
            }
        });
    });
});

//create new todolist to the db
router.post("/add", auth, function(req, res) {
    var taskDescription = req.body.taskDescription;
    var taskDone = req.body.taskDone;

    var newTodoList = { taskDescription: taskDescription, taskDone: taskDone };

    TodoList.create(newTodoList, function(err, createTodoList) {
        if (err) {
            console.log(err);
        } else {
            console.log(createTodoList);
            res.send(createTodoList)
        }
    });
});

 //UPDATE - logic to edit todolist
 router.put("/:id", auth, function(req, res) {
     //find and update the correct todolist
     TodoList.findByIdAndUpdate(req.params.id, {taskDescription: req.body.taskDescription, taskDone: req.body.taskDone}, {new: true}, function(err, updatedTodoList) {
        if(err){
            console.log(err);
        } else {
            console.log(updatedTodoList);
            res.send(updatedTodoList);
        }
     });
 });
 
 //destroy
 router.delete("/:id", auth, function (req, res) {
     TodoList.findById(req.params.id, function (err, foundTodoList) {
         if (err) {
             console.log(err);
         } else {
             TodoList.remove({"_id": {$in: user.todolists}}, function(err) {
                if (err) {
                    console.log(err);
                }
                foundTodoList.remove();
                console.log("Todolist deleted successfully!");
             });
         }
     });
 });
 
 module.exports = router;