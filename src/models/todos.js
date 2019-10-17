var mongoose = require("mongoose");
var User = require("./user");

var todoListSchema = new mongoose.Schema ({
    taskDescription: {
        type: String,
        trim: true,
        required: true
    },
    taskDone: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model("TodoList", todoListSchema);