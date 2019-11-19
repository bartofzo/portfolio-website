import notFound from '../data/posts/404.json';

async function getPost(postId)
{
    try {
        const post = await import(`../data/posts/${postId}.json`);
        return post;
    }
    catch
    {
        return notFound;
    }
}

export default getPost;