import React from "react";
import Link from "next/link";

const page = () => {
  return (
    <div>
      <div>page</div>
      <a href="/about">more about</a>
      <br />
      <Link href={"/about"}>more about with link</Link>
    </div>
  );
};

export default page;
