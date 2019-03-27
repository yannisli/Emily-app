import React, { Component } from 'react';

import { connect } from 'react-redux';

import { withRouter } from 'react-router-dom';

import { parseForEmoji, getAuthorBlock } from '../utils/util';
import { stat } from 'fs';
/**
 * Messages module component for Manage page.
 * 
 * This module enables functionality for the 'Reaction Role' side of the bot.
 * 
 * Handles displaying registered messages that the bot has for the Guild, their registered emojis and what roles correspond to which emoji, and the interfaces for editing, removing, and creating new messages/reaction roles.
 */
class Messages extends Component {
    constructor(props) {
        super(props);

        this.showMessageModal = this.showMessageModal.bind(this);
        this.showReactionModal = this.showReactionModal.bind(this);

        this.closeMessageModal = this.closeMessageModal.bind(this);
        this.closeReactionModal = this.closeReactionModal.bind(this);

        this.showRoleDrop = this.showRoleDrop.bind(this);
        this.closeRoleDrop = this.closeRoleDrop.bind(this);

        this.chooseRole = this.chooseRole.bind(this);

        this.showEmojiDrop = this.showEmojiDrop.bind(this);
        this.closeEmojiDrop = this.closeEmojiDrop.bind(this);
        
        this.refreshEmoji = this.refreshEmoji.bind(this);
        this.chooseEmoji = this.chooseEmoji.bind(this);

        this.dispatchReactionCreate = this.dispatchReactionCreate.bind(this);

        this.deleteReaction = this.deleteReaction.bind(this);

        this.showEditReactionModal = this.showEditReactionModal.bind(this);
        this.closeEditReactionModal = this.closeEditReactionModal.bind(this);

        this.dispatchReactionEdit = this.dispatchReactionEdit.bind(this);

        this.showDeleteConfirmReaction = this.showDeleteConfirmReaction.bind(this);
        this.closeDeleteConfirmReaction = this.closeDeleteConfirmReaction.bind(this);

        this.showDeleteConfirm = this.showDeleteConfirm.bind(this);
        this.closeDeleteConfirm = this.closeDeleteConfirm.bind(this);

        this.dispatchDeleteRequest = this.dispatchDeleteRequest.bind(this);
    }
    showDeleteConfirmReaction(message, key)
    {
        this.props.dispatch({type: "REACTION_DELETE_CLICK", data: {message: message, key: key}});
    }
    closeDeleteConfirmReaction()
    {
        this.props.dispatch({type: "REACTION_DELETE_CLICKOFF"});
    }
    /**
     * Shows the delete message modal
     * @param {number} messageKey Index of which the message resides in within this.props.Guild[GuildKey].Messages
     */
    showDeleteConfirm(messageKey) {
        this.props.dispatch({type: "MESSAGE_DELETE_CLICK", data: messageKey });
    }
    /**
     * Closes the delete message modal
     */
    closeDeleteConfirm() {
        this.props.dispatch({type: "MESSAGE_DELETE_CLICKOFF"});
    }
    /**
     * Dispatches an API request to delete the message
     */
    dispatchDeleteRequest() {
        console.log("dispatching delete request");
        // Validate
        if(!this.props.DeletingMessage)
            return;
        let msg = this.props.Guild.Messages[this.props.SelectedMessageToDelete];

        if(!msg || !msg.id)
            return;
        let k = this.props.GuildKey;
        let mk = this.props.SelectedMessageToDelete;
        this.props.dispatch({type: "AWAITING_SERVER_RESPONSE"});
        console.log("auth checks pass");
        fetch(`/api/internal/messages/${msg.id}`,
        {
            method: 'DELETE'
        })
        .then( res => {
            if(res.ok)
            {
                this.props.dispatch({type: "SERVER_RESPONSE_RECEIVED", data: `Successful`});
                this.props.dispatch({type: "MESSAGE_DELETE_CONFIRM", data: {key: k, messageKey: mk}});
            }
            else
            {
                this.props.dispatch({type: "SERVER_RESPONSE_RECEIVED", data: `Received Response Code ${res.status}`});
            }
        })
        .catch( err => {
            this.props.dispatch({type: "SERVER_RESPONSE_RECEIVED", data: `Internal Server Error ${err}`});
        });
    }
    /**
     * Dispatches an API request to update the reaction
     */
    dispatchReactionEdit() {
        // Compare values, don't do anything if they're the same as before
        console.log("dispatchReactionEdit");
        if(!this.props.ReactionInEdit || !this.props.EditingReaction)
            return;
        console.log("valid state");
        let cr = this.props.ReactionInEdit.role;
        let ce = this.props.ReactionInEdit.emoji;
        let nr = this.props.ChosenRole && this.props.ChosenRole.id ? this.props.ChosenRole.id : cr;
        let ne = this.props.ChosenEmoji ? this.props.ChosenEmoji : ce;
        // TODO: Should display an error..
        if(cr === nr && ce === ne)
            return;
        console.log("valid inputs");
        // Different so make request
        this.props.dispatch({type: "AWAITING_SERVER_RESPONSE"});

        let data = {}
        data.currentRole = cr;
        data.newRole = nr;
        data.newEmoji = ne;

        let k = this.props.GuildKey;
        let mk = this.props.CurrentMessageKey;
        fetch(`/api/internal/reactions/${this.props.CurrentMessage}/${ce}`, {
            method: 'put',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }).then( res => {
            if(res.ok)
            {
                res.json()
                    .then( json => { 
                        console.log(json);
                        // JSON comes back in array form but check just in case
                        let data = json;
                        if(!data.length)
                        {
                            data = [];
                            for(let emoji in json)
                            {
                                data.push({emoji: emoji, role: json[emoji]});
                            }
                        }
                        
                        this.props.dispatch({type: "SERVER_RESPONSE_RECEIVED", data: `Successful`});
                        this.props.dispatch({type: "EDIT_REACTION_CONFIRM", data: {key: k, messageKey: mk, reactions: data}})
                    })
                    .catch( err => { this.props.dispatch({type: "SERVER_RESPONSE_RECEIVED", data: 'Received Invalid Response'})});
                
            }
            else
            {
                console.log("Create failed with", res.status);
                this.props.dispatch({type: "SERVER_RESPONSE_RECEIVED", data: `Received Response Code ${res.status}`});
            }
        }).catch(err => {
            console.log("error", err);
            this.props.dispatch({type: "SERVER_RESPONSE_RECEIVED", data: `Internal Server Error ${err}`});
        });
    }
    /**
     * Changes the UI to an edit interface where they can click on the current Emoji and change it to something else, same with the role
     * @param {Object} data {reaction: Reaction we are editing, message: message_id}
     */
    showEditReactionModal(data) {
        this.props.dispatch({type: "EDIT_REACTION_CLICK", data: data});
    }
    /**
     * Closes the edit UI
     */
    closeEditReactionModal() {
        this.props.dispatch({type: "EDIT_REACTION_CLICKOFF"});
    }
    /**
     * Shows the reaction 'modal', it is currently an inline placeholder that looks like other registered ones, but has features to differentiate it as the creation UI
     * @param {string} data The ID of the Message that the new reaction is being created for
     */
    showReactionModal(data) {
        this.props.dispatch({type: "NEW_REACTION_CLICK", data: data});
    }
    /**
     * Close the reaction modal
     */
    closeReactionModal() {     
        this.props.dispatch({type: "NEW_REACTION_CLICKOFF"});

    }
    /**
     * Show the UI to create a new message
     */
    showMessageModal() {    
        this.props.dispatch({type: "NEW_MESSAGE_CLICK"});
    }
    /**
     * Close the UI for creating a new message
     */
    closeMessageModal() {
        this.props.dispatch({type: "NEW_MESSAGE_CLICKOFF"});
    }
    /**
     * Show the role dropdown for creating a new reaction in a message
     */
    showRoleDrop() {
        this.props.dispatch({type: "NEW_REACTION_ROLE_CLICK"});
        document.addEventListener('click', this.closeRoleDrop);
    }
    /**
     * Close the role dropdown
     */
    closeRoleDrop() {
        this.props.dispatch({type: "NEW_REACTION_ROLE_CLICKOFF"})
        document.removeEventListener('click', this.closeRoleDrop);
    }
    /**
     * Dispatch to Redux to update state that we selected a new emoji
     * @param {string} emoji The emoji ID of the selected emoji for creating a new reaction
     */
    chooseEmoji(emoji) {
        this.props.dispatch({type: "NEW_REACTION_EMOJI_SELECT", data: emoji});
    }
    /**
     * Dispatch an API request to pull Emoji data for the guild
     * @param {string} guild The ID of the Guild 
     */
    refreshEmoji(guild) {
        // We're loading already, so don't do anything
        if(this.props.LoadingEmoji)
            return;
        this.props.dispatch({type: "NEW_REACTION_EMOJI_LOADING"});
        fetch(`/api/internal/emojis/${guild}`, { method: 'GET'})
            .then(res => {
                if(!res.ok)
                {   
                    this.props.dispatch({type: "NEW_REACTION_EMOJI_DATA", data: null});
                    console.log("internal server error for refresh emoji", res.status);
                    return;
                }
                res.json()
                    .then( json => {
                        
                        this.props.dispatch({type: "NEW_REACTION_EMOJI_DATA", data: {Guild: guild, Emojis: json}});
                    
                        
                    })
                    .catch( err => {
                        this.props.dispatch({type: "NEW_REACTION_EMOJI_DATA", data: null});
                        console.log("Internal JSON Error", err);
                    });
            })
            .catch( err => {
                this.props.dispatch({type: "NEW_REACTION_EMOJI_DATA", data: null});
                console.log("Internal Fetch Error", err);
            });
    }
    /**
     * Show the emoji dropdown; Also determine if we need to pull emoji data
     * @param {string} guild The ID of the Guild
     */
    showEmojiDrop(guild) {
        // Determine if we need to pull Emoji data
        // Cases are: If we have emoji data already but the guild for it is not the same as this guild
        // Case two: We don't even have data
        if((this.props.EmojiList && this.props.EmojiList.Guild && this.props.EmojiList.Guild.id !== guild)
            || (!this.props.EmojiList))
            this.refreshEmoji(guild);
        // Dispatch state to display
        this.props.dispatch({type: "NEW_REACTION_EMOJI_CLICK"});
        document.addEventListener('click', this.closeEmojiDrop);
    }
    /**
     * Close the dropdown for emojis
     */
    closeEmojiDrop() {
        this.props.dispatch({type: "NEW_REACTION_EMOJI_CLICKOFF"});
        document.removeEventListener('click', this.closeEmojiDrop);
    }
    /**
     * Dispatch state change indicating our selected role
     */
    chooseRole(role) {
        this.props.dispatch({type: "NEW_REACTION_ROLE_SELECT", data: role});
    }
    /**
     * Validate that we have inputs then dispatch API request
     */
    dispatchReactionCreate() {
        // Validate
        if (!this.props.ChosenEmoji || !this.props.ChosenRole)
            return;
        // Validate that its not just empty objects
        if(!this.props.ChosenRole.id || !this.props.Guild.Roles[this.props.ChosenRole.id])
            return;

        this.props.dispatch({type: "AWAITING_SERVER_RESPONSE"});
        // Send API request to API server and set flag to display modal awaiting results
        let data = {};
        data.role = this.props.ChosenRole.id;
        data.emoji = this.props.ChosenEmoji;
        data.guild_id = this.props.Guild.id;
        data.message_id = this.props.CurrentMessage;
        data.channel_id = this.props.CurrentMessageChannel;

        let k = this.props.GuildKey;
        let mk = this.props.CurrentMessageKey;
        
        fetch(`/api/internal/reactions/create`, {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }).then( res => {
            if(res.ok)
            {
                res.json()
                    .then( json => { 
                        console.log(json);
                        // JSON can be in either object if bot is active or array if not
                        // Should be in array for reactions
                        let data = json;
                        if(!data.length)
                        {
                            data = [];
                            for(let emoji in json)
                            {
                                data.push({emoji: emoji, role: json[emoji]});
                            }
                        }
                       
                        this.props.dispatch({type: "SERVER_RESPONSE_RECEIVED", data: `Successful`});
                        this.props.dispatch({type: "UPSERT_MESSAGE_REACTION", data: {key: k, messageKey: mk, reactions: data}})
                        this.props.dispatch({type: "NEW_REACTION_DONE"});
                    })
                    .catch( err => { this.props.dispatch({type: "SERVER_RESPONSE_RECEIVED", data: 'Received Invalid Response'})});
                
            }
            else
            {
                console.log("Create failed with", res.status);
                this.props.dispatch({type: "SERVER_RESPONSE_RECEIVED", data: `Received Response Code ${res.status}`});
            }
        }).catch(err => {
            console.log("error", err);
            this.props.dispatch({type: "SERVER_RESPONSE_RECEIVED", data: `Internal Server Error ${err}`});
        });
        // Now set our state that we are awaiting server results
    }
    deleteReaction(message, emoji, key) {
        let k = this.props.GuildKey;
        // Now set our state that we are awaiting server results
        this.props.dispatch({type: "AWAITING_SERVER_RESPONSE"});
        fetch(`/api/internal/reactions/${message}/${emoji}`, {
            method: 'DELETE'
        }).then(res => {
            if(res.ok)
            {
                res.json()
                    .then(json => {
                        this.props.dispatch({type: "SERVER_RESPONSE_RECEIVED", data: `Successful`});
                        this.props.dispatch({type: "DELETE_MESSAGE_REACTION", data: {key: k, messageKey: key, reaction: emoji}});
                    })
                    .catch(err => {
                        this.props.dispatch({type: "DELETE_MESSAGE_REACTION", data: `Received Invalid Response`});
                    });
            }
            else
            {
                this.props.dispatch({type: "SERVER_RESPONSE_RECEIVED", data: `Received Response Code ${res.status}`});
                console.log("Delete fail", res.status);
            }
        }).catch(err => {
            console.log("delete error", err);
            this.props.dispatch({type: "SERVER_RESPONSE_RECEIVED", data: `Internal Server Error ${err}`});
        });
        
    }
    render()
    {
        // Array of JSX elements
        let contents = [];
        // Do we have message data
        const weHaveMessageData = this.props.Guild.Messages && this.props.Guild.Messages.length > 0;
        // Display loading if we're loading
        if(this.props.Loading)
        {
            contents = <div>Loading Data...</div>
        }
        else {
            // If we have no message data and we're not loading, it means there are none
            if(!weHaveMessageData)
            {
                // Display accordingly
                contents = (
                    <div style={{
                        'padding': '20%',
                        'margin': 'auto',
                        'textAlign': 'center'
                    }}>
                        Looks like you don't have any messages registered at the moment...<br/>
                        Click New Message to get started using the reaction roles module!
                    </div>
                );
            }
            else
            {
                // Loop through registered messages
                for(let i in this.props.Guild.Messages)
                {
                    // Helper function that parses a string for emojis and returns JSX elements corresponding to the text + emoji images
                    let content = parseForEmoji(this.props.Guild.Messages[i].contents, i);
                    // Array of elements that display the Roles
                    let roles = [];
                    // If we have roles
                    // Role dropdown
                    // TODO: This should be moved to it's own component to cut down on execution time
                    let roleDrops = [];
                    // Loop through the Role objects we got from Discord API and add them to the dropdown
                    for (let key in this.props.Guild.Roles) {
                        if(this.props.Guild.Roles[key].name === "@everyone")
                            continue;
                        let color = this.props.Guild.Roles[key].color;
                        color = typeof(color) === String ? color.parseInt(color, 10).toString(16) : color.toString(16);
                        roleDrops.push((
                            <div key={`roledrop${key}`} onClick={() => {this.chooseRole(this.props.Guild.Roles[key])}} className="reaction_drop_content"  style={{borderLeftColor: `#${color}`}}>
                                <span style={{color: `#${color}`}}>
                                    {this.props.Guild.Roles[key].name}
                                </span>
                                <span>
                                    #{key}
                                </span>
                            </div>
                        ));
                    }
                    // Emoji dropdown
                    // TODO: This should be moved to it's own component
                    let emojiDrops = [];
                    // Do we have Emojis loaded
                    if(this.props.EmojiList && this.props.EmojiList.Guild)
                    {
                        // Loop through them and add the list of images to the dropdown
                        for(let key in this.props.EmojiList.Emojis)
                        {
                            // Make sure we don't have this emoji registered already!
                            let exists = false;
                            for(let emoji in this.props.Guild.Messages[i].reactions)
                            {
                                
                                if(this.props.Guild.Messages[i].reactions[emoji].emoji === this.props.EmojiList.Emojis[key].id)
                                {
                                    exists = true;
                                    break;
                                }
                            }
                            if(!exists)
                                emojiDrops.push((
                                    <img key={`emoji${key}`} onClick={() => {
                                        this.chooseEmoji(this.props.EmojiList.Emojis[key].id);
                                    }}src={`https://cdn.discordapp.com/emojis/${this.props.EmojiList.Emojis[key].id}.png`} alt="?" className="emoji"/>
                                ));
                        }
                    }
                    if(!this.props.Guild.Messages[i].reactions || this.props.Guild.Messages[i].reactions.length === 0)
                    {
                        roles = <div>You don't have any registered roles for this message!</div>
                    }
                    else
                    {
                        // Loop through the roles and add them to the roles array
                        for(let j in this.props.Guild.Messages[i].reactions)
                        {
                            let roleid = this.props.Guild.Messages[i].reactions[j].role;
                            let emojiid = this.props.Guild.Messages[i].reactions[j].emoji;
                            let roleObj = this.props.Guild.Roles[roleid];
                            let color = this.props.Guild.Roles[roleid].color;
                            // If its a string, we have to turn it into Integer so we can use the Number.toString to convert the base 10 Discord color to a base 16 hexadecimal for CSS
                            color = typeof(color) === String ? color.parseInt(color, 10).toString(16) : color.toString(16);
                            // Push JSX elements that comprise the display for the Role
                            // Push depending if this message is the current one being editted
                            if(!this.props.EditingReaction || this.props.ReactionInEdit.emoji !== emojiid || this.props.CurrentMessageKey !== i)
                                roles.push(
                                    <div key={`msg${i}rolecont${j}`} className="manageui_content_message_role" style={{borderLeft: `4px solid #${color}`}}>
                                        <img alt="?" key={`msg${i}emoji${j}`} src={`https://cdn.discordapp.com/emojis/${emojiid}.png`} style={{padding: '4px', display: 'inline-block', width: '28px', height: '28px', verticalAlign: 'middle'}}/>
                                        <span key={`msg${i}role${j}`} style={{color: `#${color}`}}>
                                            {roleObj.name}
                                        </span>
                                        <span key={`msg${i}roleright${j}`} className="manageui_content_message_role_details">
                                            {`Role: ${roleid}`}<br/>
                                            {`Emoji: ${emojiid}`}
                                        </span>
                                        <div key={`msg${i}rolebody${j}`} className="manageui_content_message_role_body">
                                            Current Reactions - {this.props.Guild.Messages[i].discReactions[emojiid] ? this.props.Guild.Messages[i].discReactions[emojiid] : 0}
                                        </div>
                                        <span key={`msg${i}roleedit${j}`} className="manageui_content_message_role_edit_button" onClick={() => {
                                            this.showEditReactionModal({reaction: this.props.Guild.Messages[i].reactions[j], message: this.props.Guild.Messages[i].id, key: i});
                                        }}>
                                            Edit Reaction
                                        </span>

                                        {(!this.props.DeletingReaction || this.props.ReactionToDelete.message !== i || this.props.ReactionToDelete.key !== j) &&
                                            <span key={`msg${i}roledelete${j}`} className="manageui_content_message_role_delete_button" onClick={() => {
                                                //this.deleteReaction(this.props.Guild.Messages[i].id, emojiid, i);
                                                this.showDeleteConfirmReaction(i, j);
                                            }}>
                                                Delete Reaction
                                            </span>
                                        }
                                        {this.props.DeletingReaction && this.props.ReactionToDelete.message === i && this.props.ReactionToDelete.key === j &&
                                            <span>
                                                <span key={`msg${i}roledeleteconfirm${j}`} className="manageui_content_message_role_cancel_button" onClick={this.closeDeleteConfirmReaction}>
                                                    Cancel
                                                </span>
                                                <span key={`msg${i}roledeletecancel${j}`} className="manageui_content_message_role_delete_button" onClick={() => {
                                                    this.deleteReaction(this.props.Guild.Messages[i].id, emojiid, i);
                                                }}>
                                                    Confirm
                                                </span>
                                            </span>
                                        }
                                    </div>
                                );
                            else if(this.props.ReactionInEdit.emoji === emojiid && this.props.CurrentMessageKey === i) {
                                // Let the color be the new chosen role, or default to the current one
                                let chosenColor = (this.props.ChosenRole && this.props.ChosenRole.color) ? typeof(this.props.ChosenRole.color) === String ? parseInt(this.props.ChosenRole.color, 10).toString(16) : this.props.ChosenRole.color.toString(16) : color;
                                let currentEmoji = this.props.ChosenEmoji ? this.props.ChosenEmoji : emojiid;
                                let currentName = this.props.ChosenRole && this.props.ChosenRole.name ? this.props.ChosenRole.name : roleObj.name;
                                roles.push(
                                    <div key={`msg${i}rolecont${j}`} className="manageui_content_message_role" style={{borderLeft: `4px solid #${chosenColor}`}}>
                                        <img onClick={() => {this.showEmojiDrop(this.props.Guild.id)}} alt="?" key={`msg${i}emoji${j}`} src={`https://cdn.discordapp.com/emojis/${currentEmoji}.png`} style={{padding: '4px', display: 'inline-block', width: '28px', height: '28px', verticalAlign: 'middle', cursor: 'pointer'}}/>
                                        <span onClick={() => this.showRoleDrop(this.props.Guild.id)} className="reaction_modal_textbut" key={`msg${i}role${j}`} style={{color: `#${chosenColor}`}}>
                                            {currentName}
                                        </span>
                                        <span key={`msg${i}roleright${j}`} className="manageui_content_message_role_details">
                                            {`Old Role: ${roleid}`}<br/>
                                            {`Old Emoji: ${emojiid}`}
                                        </span>
                                        {/* Display role dropdown if our state is set to display it */ }
                                        {this.props.ShowRoleDropdown &&
                                            <div className="reaction_drop">
                                                {roleDrops}
                                            </div>
                                        }
                                        {/* Display emoji dropdown if our state is set to display it */ }
                                        {this.props.ShowEmojiDropdown &&
                                            <div className="emoji_drop">
                                                <div>
                                                    Available Emojis
                                                </div>
                                                <div>
                                                    {emojiDrops}
                                                </div>
                                            </div>
                                        }
                                        <div className="reaction_placeholder_body">
                                            Editing Reaction Role...
                                        </div>
                                        
                                        <div>
                                            {/* Buttons to cancel or confirm */ }
                                            <span key={`msg${i}roleconfirm${j}`} className="manageui_content_message_role_edit_button" onClick={this.dispatchReactionEdit}>
                                                Confirm Changes
                                            </span>
                                            <span key={`msg${i}rolecancel${j}`} onClick={this.closeEditReactionModal} className="manageui_content_message_role_delete_button">
                                                Cancel
                                            </span>
                                        </div>
                                    </div>
                                )
                            }
                        }
                    }
                    
                    // Chosen color of the role we have chosen
                    // TODO: This should be moved to it's own component along with the dropdowns, etc.. to cut down on processing time
                    // Will default to white
                    let chosenColor = (this.props.ChosenRole && this.props.ChosenRole.color) ? typeof(this.props.ChosenRole.color) === String ? parseInt(this.props.ChosenRole.color, 10).toString(16) : this.props.ChosenRole.color.toString(16) : "FFFFFF";
                    let element = (
                        <div key={i} className="manageui_content_message">
                            {(!this.props.DeletingMessage || this.props.SelectedMessageToDelete !== i) &&
                                <div onClick={() => this.showDeleteConfirm(i)} className="manageui_delete_message_button">
                                    Delete Message
                                </div>
                            }
                            {this.props.DeletingMessage && this.props.SelectedMessageToDelete === i &&
                                <span>
                                    <span className="manageui_cancel_message_button" onClick={this.closeDeleteConfirm}>
                                        Cancel
                                    </span>
                                    <span className="manageui_delete_message_button" onClick={this.dispatchDeleteRequest}>
                                        Confirm
                                    </span>
                                    
                                </span>
                            }
                            {/* Author of the message */ }
                            {getAuthorBlock(this.props.Guild.Messages[i].author, this.props.Guild.Messages[i].channel, this.props.Guild.Channels[this.props.Guild.Messages[i].channel], this.props.Guild.Messages[i].id, i)}
                            {/* Content body of the message */ }
                            <div key={`contents${i}`} className="manageui_content_message_contents">                
                                {content}
                            </div>
                            {/* Buttons */ }
                            <div key={`actions${i}`} className="manageui_content_message_modify">
                                <span className="login_button" style={{float: 'right'}} onClick={() => {
                                    // Which message are we adding reactions to? We need to send that so not every message will have the new reaction inline placeholder displayed
                                    this.showReactionModal({message: this.props.Guild.Messages[i].id, channel: this.props.Guild.Messages[i].channel, key: i});
                                }}>
                                    Register New Reaction
                                </span>                               
                                Registered Emojis & Roles
                                {/* In-line Placeholder to display for when we are creating a new Reaction Role, mimics already registered ones */}
                                <div key={`actionsbody${i}`} className="manageui_content_message_modify_body">
                                    {/* If we are creating a reaction then display */ }
                                    {(this.props.CreatingReaction && this.props.CurrentMessage === this.props.Guild.Messages[i].id) &&
                                        <div key={`createreact{i}`} className="reaction_placeholder" style={{
                                                borderLeft: `4px solid #${chosenColor}`
                                            }}>
                                            {/* If we have not chosen an emoji display a ? */ }
                                            {(!this.props.ChosenEmoji) &&
                                                <span onClick={() => {this.showEmojiDrop(this.props.Guild.id)}} key={`createreactemoji${i}`} style={{cursor: 'pointer', textAlign: 'center', padding: '4px', display: 'inline-block', width: '28px', height: '28px', verticalAlign: 'middle'}}>
                                                    ?
                                                </span>
                                            }
                                            {/* Otherwise display the selected emoji image */ }
                                            {this.props.ChosenEmoji &&
                                                <img alt="?" onClick={() => {this.showEmojiDrop(this.props.Guild.id)}} src={`https://cdn.discordapp.com/emojis/${this.props.ChosenEmoji}.png`} key={`createreactemoji${i}`} style={{cursor: 'pointer', textAlign: 'center', padding: '4px', display: 'inline-block', width: '28px', height: '28px', verticalAlign: 'middle'}}/>
                                            }
                                            {/* Button that has the text of the selected role, or a default 'please select your role' */ }
                                            <span key={`createreactrolebut${i}`} className="reaction_modal_textbut" onClick={this.showRoleDrop} style={chosenColor !== "FFFFFF" ? {color: `#${chosenColor}`} : {}}>                                  
                                                {this.props.ChosenRole && this.props.ChosenRole.name ? this.props.ChosenRole.name : "Please select your role"}                                            
                                            </span>
                                            {/* Display role dropdown if our state is set to display it */ }
                                            {this.props.ShowRoleDropdown &&
                                                <div className="reaction_drop">
                                                    {roleDrops}
                                                </div>
                                            }
                                            {/* Display emoji dropdown if our state is set to display it */ }
                                            {this.props.ShowEmojiDropdown &&
                                                <div className="emoji_drop">
                                                    <div>
                                                        Available Emojis
                                                    </div>
                                                    <div>
                                                        {emojiDrops}
                                                    </div>
                                                </div>
                                            }
                                            {/* Display visual information that further differentiates that this is a placeholder and the creation UI */ }
                                            <div className="reaction_placeholder_body">
                                                Creating new reaction role...
                                            </div>
                                            <div>
                                                {/* Buttons to cancel or confirm */ }
                                                <span key={`createreactconfirm${i}`} className="manageui_content_message_role_edit_button" onClick={this.dispatchReactionCreate}>
                                                    Confirm Reaction
                                                </span>
                                                <span key={`createreactcancel${i}`} onClick={this.closeReactionModal} className="manageui_content_message_role_delete_button">
                                                    Cancel
                                                </span>
                                            </div>
                                        </div>
                                    }
                                    {roles}
                                </div>
                            </div>                           
                        </div>
                    );
                    contents.push(element);
                }
            }    
        }
        // Return what this component should render
        return (
            <div>
                <hr/>
                <br/>
                <span className="manageui_subtitle">
                    Registered Messages
                </span>
                <span className="login_button" onClick={this.showMessageModal} style={{
                    'float': 'right',
                    'marginRight': '0px'
                }}>
                    New Message
                </span>
                <br/><br/>
                <div className="manageui_content">
                    {this.props.CreatingMessage &&
    
                        <div className="manageui_content_message">
                            Creating new message...            
                        </div>
                    }
                    {contents}
                </div>
            </div>
        );
    }
    // When we mount, we want to reset the state of everything as if the user did not click anything to reveal dropdowns or etc..
    componentDidMount() {
        console.log("Messages: componentDidMount()");
        this.props.dispatch({type: "MANAGE_MESSAGES_LOADING", data: true});
        this.props.dispatch({type: "NEW_REACTION_EMOJI_CLICKOFF"});
        this.props.dispatch({type: "NEW_REACTION_ROLE_CLICKOFF"});
        this.props.dispatch({type: "NEW_REACTION_CLICKOFF"});
        this.props.dispatch({type: "NEW_MESSAGE_CLICKOFF"});
        this.props.fetchMessageData(this.props.GuildKey);
    }
}

export default withRouter(connect(state => {
    return {
        Guild: state.guilds && state.guilds[state.selectedGuild] ? state.guilds[state.selectedGuild] : {}, // Guild object of the guild we're working with
        GuildKey: state.selectedGuild, // Key of it
        Loading: state.LoadingGuildMessages, // Are we loading messages
        CreatingMessage: state.CreatingMessage, // Are we creating a new message
        CreatingReaction: state.CreatingReaction, // Are we creating a new reaction
        CurrentMessage: state.CurrentMessage, // What message are we currently working on for new reaction
        CurrentMessageChannel: state.CurrentMessageChannel, // What channel does the message belong to
        CurrentMessageKey: state.CurrentMessageKey, // Index
        ChosenEmoji: state.ChosenEmoji, // What emoji did we choose
        EmojiList: state.EmojiList, // List of emojis for this guild
        ChosenRole: state.ChosenRole, // What role did we choose
        ShowRoleDropdown: state.ShowRoleDropdown, // Should we show the role dropdown
        ShowEmojiDropdown: state.ShowEmojiDropdown, // Should we show the emoji dropdown
        LoadingEmoji: state.LoadingEmoji, // Are we loading emojis?
        SendingReaction: state.SendingReaction, // Are we sending a create reaction?
        EditingReaction: state.EditingReaction, // Are we editing a reaction
        ReactionInEdit: state.ReactionInEdit, // Current reaction we are editing
        DeletingMessage: state.DeletingMessage, // Are we deleting a message
        SelectedMessageToDelete: state.SelectedMessageToDelete, // Which message
        DeletingReaction: state.DeletingReaction, // Are we deleting a reaction
        ReactionToDelete: state.ReactionToDelete, // Which reaction
    }
})(Messages));