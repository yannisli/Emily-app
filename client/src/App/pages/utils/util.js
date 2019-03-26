
import React from 'react';
/**
 * Helper function that takes parameters and returns JSX that comprises the author avatar, name and in what channel the message was in
 * @param {Object} author The Author Object obtained from Discord, contains ID, avatar hash, name, etc..
 * @param {string} channel_id Channel ID
 * @param {string} channel_name Name of the Channel
 * @param {string} message_id Message ID
 * @param {number} key Optional key if it is within an array for React
 * @returns {JSX} JSX elements comprising the author avatar, name and in what channel the message was in, along with the message ID.
 */
const getAuthorBlock = (author, channel_id, channel_name, message_id, key = 0) =>
{
    return (<div key={key} className="manageui_content_message_author">
        <div key={`authavatar${key}`} className="avatar" style={{'background': `url(https://cdn.discordapp.com/avatars/${author.id}/${author.avatar}.png?size=32)`}}/>
        <div key={`authintern${key}`} className="manageui_content_message_author_internal">
            {author.username}
            <span>
                #{author.discriminator}
            </span>
            <span> in </span>
            {channel_name}
            <span>
                #{channel_id}
            </span>
            <span key={`authmsgid${key}`} className="manageui_content_message_right">
                {message_id}
            </span>
        </div>
    </div>);
}
/**
 * Helper function that takes a string of text, evaluates it for Discord emoji (<:name:snowflake>) and returns JSX where the emoji matches are converted into images, and the rest are within span elements for plain text.
 * @param {string} parsetxt String of text to parse for emojis
 * @param {number} key Optional key if it is within an array for React
 * @returns {JSX} JSX elements comprising of span elements for plain text, and img elements for emojis
 */
const parseForEmoji = (parsetxt, key = 0) =>
{
    let content = parsetxt;
    // We need to parse the contents into emoji images if there are any
    // They are denoted by <:wordidentifier:emoji>
    // Hold our array of elements
    let newContent = [];
    // Our array of regex matches, returns null if none found
    let regex = content.match(/<:[A-Za-z0-9]*:[0-9]*>/g);
    

    // If there are matches
    if(regex !== null)
    {
        // Loop through them
        for(let j = 0; j < regex.length; j++)
        {
            if(content === undefined)
                break;
            // Explode the content string based on the Regex match
            let str = regex[j];
            let expl = content.split(str);
            // Returns an array of at least 2 elements
    

            
            // Find the numerical ID.. it will be in element 2 as splitting a <:iden:id> will have 3 elements
            let id = str.split(":");
            
            // Push text from before however need to check for newlines first..
            let newlines = expl[0].split("\n");
            // If length is greater than 1, there are newlines and we need to deal with that accordingly
            if(newlines.length > 1)
            {
                // newlines[0] will not need a newline before, so push that here
                newContent.push(<span key={`msg${key}regex(${j})nl0`}>{newlines[0]}</span>);
                // Starting from index 1
                for(let x = 1; x < newlines.length; x++)
                {
                    // Push a newline
                    newContent.push(<br key={`msg${key}regex(${j})br${x}`}/>);
                    // Push the text after the newline
                    newContent.push(<span key={`msg${key}regex(${j})sp${x}`}>{newlines[x]}</span>);
                }
            }
            else { // There were no newlines, so just push the entire string
                newContent.push((
                    <span key={`msg${key}regex(${j})sp0`}>{expl[0]}</span>
                ));
            }
            // Push emoji img, Discord displays emoji at 21x21, so we will replicate that here
            // The numerical ID will have a > appended to it, so we do a substr of 0 to length - 1 to retrieve only the Snowflake ID of the emoji to use for the cdn endpoint
            newContent.push((
                <img alt="?" key={`msg${key}regex(${j})img`}src={`https://cdn.discordapp.com/emojis/${id[2].substr(0, id[2].length-1)}.png`} style={{
                        'width': '21px',
                        'height': '21px',
                        'display': 'inline-block',
                        'verticalAlign': 'middle'
                    }}/>
            ));
            
            // If our string.split returned 3 or more elements, there were multiple occurences of the same emoji, and we have to readd them back to the content str for later iterations
            if(expl.length >= 3)
            {
                // Start it off with the string we have that is right after the first occurence of the emoji
                let concat = expl[1];
                // Then loop and append
                for(let x = 2; x < expl.length; x++)
                {
                    // Add our emoji back
                    concat += str;
                    // Add the text after that emoji
                    concat += expl[x];
                }
                // Update the string we're manipulating to the fixed one
                content = concat;
            } else
            {
                // Update the string we're manipulating to the remaining text we still need to add to our array of elements
                content = expl[1];
            }
            
            
        }
        // Once all done, push the remaining string at the end
        newContent.push((
            <span key={`msg${key}end`}>{content}</span>
        ));
        // And assign for display
        content = newContent;
    }
    return content;
}

const getHexaColor = color => typeof(color) === String ? color.parseInt(color, 10).toString(16) : color.toString(16);
export { parseForEmoji, getAuthorBlock, getHexaColor };