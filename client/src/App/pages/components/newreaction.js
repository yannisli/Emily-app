import React, {Component} from 'react';

import { withRouter} from 'react-router-dom';

import { connect } from 'react-redux';

class NewReactionModal extends Component {
    constructor(props)
    {
        super(props);

        this.closeModal = this.closeModal.bind(this);
    }

    closeModal() {
       
        document.getElementById('manage_root').style.filter = 'none';
        this.props.dispatch({type: "NEW_REACTION_CLICKOFF"});
    }
    
    render()
    {
        return (
            <div>
                {this.props.Display &&
                    <div id="create_reaction" className="manageui_create_reaction_modal">
                        <div className="manageui_create_reaction_modal_contents">
                            <span className="red_text_button" onClick={this.closeModal}>Close</span>
                            <span className="reaction_modal_title">
                                New Reaction Emoji
                            </span>
                            <div className="reaction_modal_body">
                                <span className="reaction_modal_textbut">
                                    Select Emoji
                                </span>
                                <span className="reaction_modal_textbut">
                                    Select Role
                                </span>
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
        Display: state.CreatingReaction,
        Message: state.CurrentMessage
    }
})(NewReactionModal));