import notFound from './json/pages/404.json';

/*
async function wait(ms) {
    return new Promise(resolve => {
      setTimeout(resolve, ms);
    });
}
*/

async function getPage(pageId)
{
    try {
        const page = await import(`./json/pages/${pageId}.json`);
        return page;
    }
    catch
    {
        console.log('dfg');
        return notFound;
    }
}

export default getPage;