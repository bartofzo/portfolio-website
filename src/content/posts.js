import React, { useState, useEffect } from 'react';
import Post from './post.js';


class Posts extends React.Component
{
    render()
    {
        const posts = this.props.posts || [];

        return (
            <div className="posts" ref={this.postContainerRef}>
                { posts.map((id, index) => 

                    <Post 
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