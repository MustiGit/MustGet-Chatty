var mongoose = require('mongoose');

var messageSchema = mongoose.Schema({
    _Id: mongoose.Schema.Types.ObjectId,

    username: {
        type: String,
        maxlength: 15,
    },
    message: {
        type: String,
    },
    timestamp: {
        type: Date, default: Date.now
    },

});

var Messages = mongoose.model('Message', messageSchema);

module.exports = Messages;