import { exec } from "child_process";

// Check if Hardhat node is running on localhost:8545
const checkHardhatNode = () => {
  return new Promise((resolve) => {
    exec(
      'curl -s -X POST -H "Content-Type: application/json" --data \'{"jsonrpc":"2.0","method":"web3_clientVersion","params":[],"id":1}\' http://localhost:8545',
      (error, stdout, stderr) => {
        if (error || stderr) {
          resolve(false);
          return;
        }
        try {
          const response = JSON.parse(stdout);
          if (response.result && response.result.toLowerCase().includes("hardhat")) {
            resolve(true);
          } else {
            resolve(false);
          }
        } catch {
          resolve(false);
        }
      }
    );
  });
};

const main = async () => {
  const isRunning = await checkHardhatNode();

  if (!isRunning) {
    console.error("\n❌ Hardhat node is not running on localhost:8545!\n");
    console.error("Please start the Hardhat node first:");
    console.error("  1. cd fhevm-hardhat-template");
    console.error("  2. npx hardhat node\n");
    console.error("Then run this command again.\n");
    process.exit(1);
  }

  console.log("✅ Hardhat node detected on localhost:8545");
};

main();

