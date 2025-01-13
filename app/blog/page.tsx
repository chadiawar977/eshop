import React from "react";
import { Suspense } from "react";
import Details from "@/app/blog/Details";
const page = () => {
  return (
    <div>
      <Suspense>
        <Details />
      </Suspense>
    </div>
  );
};

export default page;
