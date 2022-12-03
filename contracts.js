const ethers = require("ethers");
// const solc = require("solc")
const fs = require("fs");
var admin = require("firebase-admin");

require("dotenv").config();

let provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
let wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const abi = fs.readFileSync("./contract/kiritsu_sol_Storage.abi", "utf-8");
let smartContract = new ethers.Contract(
  "0xc1c06D52B680BCC6832157B1f2fAC3701C2a6BFb",
  abi,
  provider
);

var serviceAccount = require("./db.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();
console.log(db);

async function main(_steamId, _gameId, _time, _stake) {
  // First, compile this!
  // And make sure to have your ganache network up!
  let options = { value: ethers.utils.parseEther(_stake) };
  let transaction = await smartContract.populateTransaction.task(
    _time,
    _gameId,
    _steamId,
    options
  );
  return transaction;
}

async function getInformation(_address) {
  let info = await smartContract.info(_address);
  console.log();
  await db
    .collection("Addresses")
    .doc(_address.toString())
    .set({ ...JSON.parse(JSON.stringify(info)) });
}

async function claim(_idn) {
  let transaction = await smartContract.populateTransaction.refresh(_idn);
  console.log(await wallet.sendTransaction(transaction));
}

// main(3489348, 3943493, 343434, "0.000")
//   .then(() => process.exit(0))
//   .catch((error) => {
//     console.error(error);
//     process.exit(1);
//   });
getInformation("0x6332264bcf485381b64413b9a8f1735b4e97dca1");
claim(0);
