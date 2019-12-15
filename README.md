## Page JSON Format:
```
{
    "pageId" : "home",
    "title" : "Home",
    "content" : "hello world",

    // Supply an image that will function as the source for the color of the background triangles
    "backgroundColorSampler" : {
        "src" : "gradient.jpg"
    },

    // Supply images that will overlay the triangle pattern
    "imagePoints" : [
        {
            "src" : "flux3.jpg",
            "left" : 0,
            "top" : 0,
            "right" : "50%",
            "alpha" : 0.5
        },
        {
            "src" : "flux4.jpg",
            "left" : "50%",
            "top" : "50%",
            "right" : 0,
            "alpha" : 0.5
        }],

    // Supply id's (should be JSON files in posts folder) of the posts this page contains
    "posts" : 
    [
        "flux",
        "bio",
        "bio_music",
        "bio_developer"
        
    ],

    // Supply what should be visible in the index. If a postId is supplied it will link to the corresponding post on the page
    "index" : [

        {
            "title" : "Bart",
            "postId" :"bio"
        },

        {
            "title" : "van de Sande"
            "to" : "/about" // supply path if index element needs to point to a subpage on the site
        }
    ]
}
```

## Improvements

- Change pageIndex to and postId to one field and make an enum that determines the type of link
- Centralize all delayed link values into one JSON config
- Anchors for navigating to another page via the index