import React, { useState, useEffect } from 'react';
import Post from './post.js';


class Posts extends React.Component
{
    render()
    {
        const posts = this.props.posts || [];
        const hideClass = this.props.hide ? 'hide' : '';

        return (
            <div className={`posts ${hideClass}`} ref={this.postContainerRef}>
                { posts.map((id, index) => 

                    <Post 
                        onLargeImage={this.props.onLargeImage}
                        index={index}
                        key={id} 
                        postId={id} 
                        setRef={(ref) => this.props.setRef(ref, id)}
                         />

                )}
            </div>
        )
    }
}


export default Posts;