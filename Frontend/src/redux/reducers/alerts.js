import {
    MESSAGES_ADDED,
    MESSAGES_CLEAR,
  } from '../constrants/actionTypes';
  
    let messagesList = [];
    export default (state = {}, action) => {
        switch (action.type) {
            case MESSAGES_ADDED:
                return handleMessages(action.messages)
                // return {
                //     ...action.messages
                // };
            case MESSAGES_CLEAR:
                return clearMessages()
            default:
                return state;
    }

    function handleMessages(messages) {
        if(messagesList.length === 0)
            messagesList = messages;
        else {
            for (let i = 0; i < messages.length; i++) {
                const msg = findMessage(messages[i]);
                if(!msg)
                    messagesList.push(messages[i]);
            }
        }
        return messagesList;
    }
    
    function findMessage(msg) {
        for (let i = 0; i < messagesList.length; i++) {
            if(messagesList[i].name == msg.name)
                return messagesList[i];
        }
        return false;
    }

    function clearMessages() {
        messagesList = [];
        return messagesList;
    }
};