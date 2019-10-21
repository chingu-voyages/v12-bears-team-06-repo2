var express = require("express");
var router = express.Router();
var TodoList = require("../models/todos");
var User = require("../models/user");
var auth = require("../middleware/auth");

//show all todos
router.get("/", auth, function(req, res) {
    TodoList.find({'author.id': req.user._id}).exec(function(err, allTodoList){
        if (err) {
            console.log(err.message);
        } else {
            // console.log(allTodoList);
            res.send(allTodoList);
        }
    });
});

//create new todolist to the db
router.post("/add", auth, function(req, res) {
    var taskDescription = req.body.taskDescription;
    var taskDone = req.body.taskDone;
    var author = {
        id: req.user._id,
        username: req.user.username
    }

    var newTodoList = { taskDescription: taskDescription, taskDone: taskDone, author: author };

    console.log(author.id);
    console.log(author.username);
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
             TodoList.remove({"_id": {$in: User.todolists}}, function(err) {
                if (err) {
                    console.log(err);
                }
                foundTodoList.remove();
                console.log("Todolist deleted successfully!");
                res.send("Todolist deleted successfully!").status(200);
             });
         }
     });
 });
 
 module.exports = router;