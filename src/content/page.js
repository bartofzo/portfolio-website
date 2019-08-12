import React, { useState, useEffect, useRef } from 'react';
import Post from './post.js';
import Posts from './posts.js';
import PageIndex from './pageindex.js';
import getPage from '../data/pagedata.js';
import SmoothScrollWindow from '../util/smoothscrollwindow.js';

function Page(props)
{

    const { pageId } = props;
    const [page, setPage] = useState({});
    const [pageIndexElements, setPageIndexElements] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);

    const postRefs = useRef({});
    const pageRef = useRef([]);


    const createPageIndex = (pageToIndex) => {
        return pageToIndex.index.map((indexElement) => {
            return {
                title : indexElement.title,
                postId : indexElement.post
            }
        })
    }

    const setPostRef = (element, index) => {
        postRefs.current[index] = element;
    }

    const onIndexClick = (postId) => {
        if (postId && postRefs.current[postId])
        {
            SmoothScrollWindow.scrollTo(postRefs.current[postId], 500);
        }
    }

	useEffect(() => {
		async function fetchPage() {

            const loadedPage = await getPage(pageId);
            
            setPage(loadedPage);
            setIsLoaded(true);

            const pageInfo = {
                loaded : true,
                pageIndex :  createPageIndex(loadedPage)
            }
           
            setPageIndexElements(pageInfo.pageIndex);
            props.onPageLoaded(pageInfo);

		}
		fetchPage();
    }, [pageId]); // second [] argument only executes this effect after mounting and not on updates
    
    if (!isLoaded)
    {
        return null;
    }

    const style = props.hoverIndexPostId ? { cursor : 'pointer' } : null;

    return (
        <div className="page" ref={pageRef} style={style} onClick={() => onIndexClick(props.hoverIndexPostId)}>

            <PageIndex pageIndexElements={pageIndexElements} indexStyles={props.indexStyles} onClick={onIndexClick} />
            <Posts posts={page.posts} setRef={setPostRef} />
            
        </div>
    )
}

export default Page;