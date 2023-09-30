import express from "express";
import _ from "lodash";
import {exec} from "child_process";
import { time } from "console";
const app = express();

//**MIDDLEWARE**
app.use(async(req,res,next)=>{
    try {
        const curl_command = `curl --request GET \
        --url "https://intent-kit-16.hasura.app/api/rest/blogs" \
        --header "x-hasura-admin-secret: 32qR4KmXOIpsGPQKMqEJHGJS27G5s7HdSKO3gdtQd2kv5e852SiYwWNfxkZOBuQ6"`
        
        exec(curl_command ,{ encoding: 'utf-8' }, (error, stdout, stderr) => {
            if (error !== null) {
                console.log('Error in curl command execution', error, stderr) 
            }
            else{
                const response = JSON.parse(stdout)
                req.blogs = response.blogs;
                next();
            }
        })
    }
    catch(e){
        console.log("Error in fetching blogs from source : ",e.message);
    }
})


//**DATA ANALYSIS**
app.get('/api/blog-stats' ,async (req,res)=>{
    try{
        const blogs = req.blogs;
        const total_blogs_fetched = _.size(blogs);
        // console.log(total_blogs_fetched );

        const blog_with_longest_title = _.maxBy(blogs , function(blog) {return _.size(blog.title);}) ;
        // console.log(longest_title);

        const titles_containing_privacy =  _.countBy(blogs , function(blog) { 
            return _.lowerCase(blog.title).includes("privacy") }).true
        // console.log(titles_containing_privacy.true)

        const unique_titles_array =  _.uniqBy(blogs , function(blog) { return blog.title })
        // console.log(unique_titles)

        //**RESPONSE**
        const resObj = {
            total_blogs_fetched , 
            longest_title : blog_with_longest_title.title  , 
            titles_containing_privacy , 
            unique_titles : _.size(unique_titles_array)
        }
        // console.log(resObj)
        res.json(resObj)

    }
    catch(e){
        console.log("Error in analysing blogs : ",e.message);
        res.status(401).json("Error in analysing blogs")
    }

})

// **BLOG SEARCH ENDPOINT**
app.get('/api/blog-search', async(req,res)=>{
    try {
        const blogs = req.blogs;
        //Displaying all blogs containing value described in query
        const search_value = _.lowerCase(req.query.query) 
        const filtered_blogs =  _.filter(blogs , function(blog) { 
            return _.lowerCase(blog.title).includes(search_value) })
        const results_fetched = _.size(filtered_blogs)
        res.json({search_value,results_fetched,filtered_blogs})
    }
    catch(e){
        console.log("Error in analysing blogs : ",e.message);
        res.status(401).json("Error in searching and filtering blogs")
    }
})

app.listen(3000, function() {
    console.log("Server started on port 3000");
  });



