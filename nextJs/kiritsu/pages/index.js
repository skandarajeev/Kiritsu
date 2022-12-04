import React from "react";
import Countdown from "react-countdown";
import { useState, useEffect } from "react";
import { BigNumber } from "ethers";

// ReactDOM.render(
//   <Countdown date={Date.now() + 10000} />,
//   document.getElementById("root")
// );

export default function Timer() {
  const [data, setData] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [tasks] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch("/api/hello")
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      });
  }, []);

  if (isLoading) return <p>Loading...</p>;
  if (!data) return <p>No profile data</p>;

  let dataKeys = Object.keys(data);
  dataKeys.forEach((key) => {
    data[key] = data[key].map((item) => BigNumber.from(item).toString());
  });
  // for (let i = 0; i < data.length; i++) {
  //   console.log(data[i]);
  //   data[i].forEach((j, index) => {
  //     data[i][index] = j;
  //   });
  // for (let  = 0; j < 5; j++) {
  //   tasks[i][j] = ethers.BigNumber.toBigInt(data[i][j]);
  //   console.log(j);
  // }
  const Completionist = () => <span>You are good to go!</span>;
  return (
    <div>
      <h1>Stake is {data[0][0]}</h1>
      <h1>Game Id is {data[0][1]}</h1>
      <h1>Steam Id is {data[0][2]}</h1>
      <Countdown date={data[0][4]}>
        <Completionist />
      </Countdown>
    </div>
  );
}

// export async function getStaticProps() {
//   const res = await fetch("http:/localhost:3000/api/hello/");

//   return {
//     props: {
//       allPostsData: await res.json(),
//     },
//   };
// }
