// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

export default async function getInfo(req, res) {
  // Instead of the file system,
  // fetch post data from an external API endpoint
  const data = await fetch("http://localhost:4000/info");
  const jdata = await data.json();
  return res.json(jdata);
}
