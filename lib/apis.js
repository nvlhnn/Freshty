import "../envConfig";

export async function getStaticProps() {
  const productApiUrl = process.env.PRODUCT_API_URL;

  return {
    props: {
      productApiUrl,
    },
  };
}
