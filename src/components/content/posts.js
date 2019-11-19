import React, { useState, useEffect } from 'react';
import Post from './post.js';

class Posts extends React.Component
{
    render()
    {
        // On a page without posts, don't even render the container div, because
        // the padding of 1px (to prevent top post from touching index triangles)
        // will cause a scrollbar
        if (!this.props.posts || this.props.posts.length < 1)
            return null;

        const hideClass = this.props.hide ? 'hide' : '';

        return (
            <div className={`posts ${hideClass}`} ref={this.postContainerRef}>
                { this.props.posts.map((postId, index) => 

                    <Post 
                        onLargeImage={this.props.onLargeImage}
                        hide={this.props.hide}
                        index={index}
                        key={index} 
                        postId={postId}
                        setRef={(ref) => this.props.setRef(ref, postId)}
                        onFadeOut={this.props.onFadeOut}
                         />

                )}

           
            </div>
        )
    }
}


export default Posts;