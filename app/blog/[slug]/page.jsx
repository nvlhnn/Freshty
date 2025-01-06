import React from "react";

const page = ({ params }) => {
  return <div>this blog is about {params.slug}</div>;
};

export default page;
