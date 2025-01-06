import React from "react";
import Link from "next/link";
import { getBlogs } from "@/lib/blogs";

const page = async () => {
  //   const [blogs, setBlogs] = React.useState([]);

  //   React.useEffect(() => {
  //     getBlogs().then(setBlogs);
  //   }, []);

  const blogs = await getBlogs();
  console.log(blogs);

  return (
    <div>
      <h1>Blog</h1>
      {blogs.map((blog) => (
        <div key={blog.id}>
          <Link href={`/blog/${blog.id}`}>{blog.title}</Link>
        </div>
      ))}
      {/* <Link href={"/blog/1"}>Blog page 1</Link>
      <br />
      <Link href={"/blog/2"}>Blog page 2</Link> */}
    </div>
  );
};

export default page;
