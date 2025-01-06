export async function getBlogs() {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return [
    { id: 1, title: "Blog 1" },
    { id: 2, title: "Blog 2" },
    { id: 3, title: "Blog 3" },
  ];
}
