import React, { Component } from 'react';

import { withRouter } from 'react-router-dom';

import { connect } from 'react-redux';

import { parseForEmoji, getAuthorBlock } from '../utils/util';

class NewMessageModal extends Component
{
    constructor(props)
    {
        super(props);

        this.closeModal = this.closeModal.bind(this);
        this.toggleAllow = this.toggleAllow.bind(this);
        this.handleTextChange = this.handleTextChange.bind(this);
        this.fetchPreview = this.fetchPreview.bind(this);
    }

    

    closeModal() {
       
        
        document.getElementById('manage_root').style.filter = 'none';
        this.props.dispatch({type: "NEW_MESSAGE_CLICKOFF"});
        
       
    }
    toggleAllow(state) {
        if(this.props.LetBot === state)
            return;
        this.props.dispatch({type: "NEW_MESSAGE_ALLOWBOT", data: state});
    }

    handleTextChange(event) {
        
        let invalids = /(?![0-9])./g

        if(invalids.test(event.target.value))
            event.target.value = event.target.value.replace(invalids, "");
    }

    fetchPreview(channel_id, message_id) {
        // Api request
        this.props.dispatch({type: "NEW_MESSAGE_PREVIEW_LOADING"});
        fetch(`/api/internal/messages/${channel_id}/${message_id}`, {method: 'GET'})
            .then(res => {
                if(!res.ok)
                {
                    console.log("fetch preview returned not ok", res.status);
                    this.props.dispatch({type: "NEW_MESSAGE_PREVIEW", data: {error: `Internal server errored with code ${res.status}`}});
                    return;
                }
                res.json()
                    .then(json => {

                        this.props.dispatch({type: "NEW_MESSAGE_PREVIEW", data: json});
                    })
                    .catch(err => {
                        console.log("fetch preview json error", err);
                        this.props.dispatch({type: "NEW_MESSAGE_PREVIEW", data: {error: 'JSON parse error'}})
                    })
            })
            .catch(err => {
                console.log("fetch preview error", err);
                this.props.dispatch({type: "NEW_REACTION_MESSAGE_PREVIEW", data: {error: 'API Request failed'}});
            });
    }
    render()
    {
        
        let previewAuthBlock = (this.props.Preview && this.props.Preview.author) ? getAuthorBlock(this.props.Preview.author, this.props.Preview.channel_id, this.props.Preview.channelName, this.props.Preview.id) : <div></div>;
        let previewContents = (this.props.Preview && this.props.Preview.content) ? parseForEmoji(this.props.Preview.content) : <div></div>;
        console.log('previewAuthBlock', previewAuthBlock);
        return (
            <div>
                

                {this.props.Display &&
                    <div id="create_reaction" className="manageui_create_reaction_modal">
                        <div className="manageui_create_reaction_modal_contents">
                            <span className="red_text_button" onClick={this.closeModal}>Close</span>
                            <span className="reaction_modal_title">
                                New Reaction Message
                            </span>
                            <div className="reaction_modal_body">
                                <div>
                                    <span className="reaction_modal_subtitle">
                                        Let the bot create a new message?
                                    </span>
                                    <span className={this.props.LetBot ? 'reaction_modal_active' : 'reaction_modal_textbut'} onClick={() => this.toggleAllow(true)}>
                                        Yes
                                    </span>
                                    <span className={!this.props.LetBot ? 'reaction_modal_active' : 'reaction_modal_textbut'} onClick={() => this.toggleAllow(false)}>
                                        No
                                    </span>
                                </div>
                                {/* Change based on we're allowing the bot or not */ }
                                {this.props.LetBot &&
                                    <div>
                                        Allowed Stuff
                                    </div>
                                }
                                {!this.props.LetBot &&
                                    <div>
                                        <div className="reaction_modal_subtitle">
                                            Please enter the channel of the message that you want registered
                                        </div>
                                        <textarea id="reaction_modal_channeltext" type="number" maxLength="21" className="reaction_modal_textarea" placeholder="ex. 555627749642076160" onChange={this.handleTextChange}/>
                                        <div className="reaction_modal_subtitle">
                                            Please enter the message ID of the message you want registered
                                        </div>
                                        <textarea id="reaction_modal_messagetext" type="number" maxLength="21" className="reaction_modal_textarea" placeholder="ex. 555627749642076160" onChange={this.handleTextChange}/>
                                        <span className="reaction_modal_textbut" onClick={() => {
                                            this.fetchPreview(document.getElementById("reaction_modal_channeltext").value, document.getElementById("reaction_modal_messagetext").value);
                                        }}>Fetch Message Preview</span>
                                        {this.props.PreviewLoading &&
                                            <div className="reaction_modal_messagepreview">
                                                Loading data...
                                            </div>
                                        }
                                        {(this.props.Preview && !this.props.PreviewLoading) &&
     
                                            <div className="reaction_modal_messagepreview">
                                                
                                                {previewAuthBlock}
                                                <div className="reaction_modal_messagepreview_contents">
                                                    {previewContents}
                                                </div>
                                                
                                            </div>
                      
                                        }
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                }
            </div>
        );
    }

    
}

export default withRouter(connect(state => {
    return {
        Guild: state.guilds && state.guilds[state.selectedGuild] ? state.guilds[state.selectedGuild] : {},
        GuildKey: state.selectedGuild,
        Display: state.CreatingMessage,
        LetBot: state.BotAllow,
        Preview: state.PreviewMessage,
        PreviewLoading: state.MessagePreviewLoading
    }
})(NewMessageModal));