import React, { useState, useEffect, useRef } from 'react';
import Posts from './posts.js';
import PageIndex from './pageindex.js';
import getPage from '../data/pagedata.js';
import SmoothScrollWindow from '../util/smoothscrollwindow.js';
import LargeImage from './largeimage.js';
import { Helmet } from 'react-helmet';

function Page(props)
{

    const { pageId } = props;
    const [page, setPage] = useState({});
    const [largeImage, setLargeImage] = useState(null);

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
                pageIndex :  createPageIndex(loadedPage),
                backgroundImage : loadedPage.backgroundImage
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
        <React.Fragment>
            <Helmet>
                <title>{`${page.title} | Bart van de Sande`}</title>
            </Helmet>
            <div className="page" ref={pageRef} style={style} onClick={() => onIndexClick(props.hoverIndexPostId)}>

                <PageIndex pageIndexElements={pageIndexElements} indexStyles={props.indexStyles} onClick={onIndexClick} />
                <Posts posts={page.posts} setRef={setPostRef} onLargeImage={setLargeImage} hide={largeImage} />
                <LargeImage image={largeImage} onClose={() => setLargeImage(null)} />

            </div>
        </React.Fragment>
    )
}

export default Page;