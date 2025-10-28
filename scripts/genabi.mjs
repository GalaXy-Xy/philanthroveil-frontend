import * as fs from "fs";
import * as path from "path";

const CONTRACT_NAME = "PhilanthroVeil";

// Path to hardhat template
const rel = "../fhevm-hardhat-template";

// Output directory
const outdir = path.resolve("./abi");

if (!fs.existsSync(outdir)) {
  fs.mkdirSync(outdir, { recursive: true });
}

const dir = path.resolve(rel);
const dirname = path.basename(dir);

const line =
  "\n===================================================================\n";

if (!fs.existsSync(dir)) {
  console.error(
    `${line}Unable to locate ${rel}. Expecting <root>/${dirname}${line}`
  );
  process.exit(1);
}

const deploymentsDir = path.join(dir, "deployments");

function readDeployment(chainName, chainId, contractName, optional) {
  const chainDeploymentDir = path.join(deploymentsDir, chainName);

  if (!fs.existsSync(chainDeploymentDir)) {
    console.error(
      `${line}Unable to locate '${chainDeploymentDir}' directory.\n\n1. Goto '${dirname}' directory\n2. Run 'npx hardhat deploy --network ${chainName}'.${line}`
    );
    if (!optional) {
      process.exit(1);
    }
    return undefined;
  }

  const contractFile = path.join(chainDeploymentDir, `${contractName}.json`);
  
  if (!fs.existsSync(contractFile)) {
    console.warn(`${line}Contract ${contractName} not found in ${chainName} deployment.${line}`);
    if (!optional) {
      process.exit(1);
    }
    return undefined;
  }

  const jsonString = fs.readFileSync(contractFile, "utf-8");
  const obj = JSON.parse(jsonString);
  obj.chainId = chainId;

  return obj;
}

// Try to read deployments
const deployLocalhost = readDeployment("localhost", 31337, CONTRACT_NAME, true);

let deploySepolia = readDeployment("sepolia", 11155111, CONTRACT_NAME, true);

// Fallback if no deployments found
if (!deployLocalhost && !deploySepolia) {
  console.warn(
    `${line}No deployments found for ${CONTRACT_NAME}.\n\nCreating placeholder ABI files.\nPlease deploy the contract to use the app:\n1. cd ${dirname}\n2. npx hardhat node (in terminal 1)\n3. npx hardhat deploy --network localhost (in terminal 2)${line}`
  );
  
  // Create placeholder files
  const placeholderABI = {
    abi: []
  };
  
  const placeholderAddresses = {
    "11155111": {
      address: "0x0000000000000000000000000000000000000000",
      chainId: 11155111,
      chainName: "sepolia",
    },
    "31337": {
      address: "0x0000000000000000000000000000000000000000",
      chainId: 31337,
      chainName: "localhost",
    },
  };
  
  const tsCode = `/*\n  This file is auto-generated.\n  Command: 'npm run genabi'\n  \n  NOTE: Placeholder - deploy contract first.\n*/\nexport const ${CONTRACT_NAME}ABI = ${JSON.stringify(placeholderABI, null, 2)} as const;\n`;
  const tsAddresses = `/*\n  This file is auto-generated.\n  Command: 'npm run genabi'\n  \n  NOTE: Placeholder - deploy contract first.\n*/\nexport const ${CONTRACT_NAME}Addresses = ${JSON.stringify(placeholderAddresses, null, 2)};\n`;
  
  fs.writeFileSync(path.join(outdir, `${CONTRACT_NAME}ABI.ts`), tsCode, "utf-8");
  fs.writeFileSync(path.join(outdir, `${CONTRACT_NAME}Addresses.ts`), tsAddresses, "utf-8");
  
  console.log("✅ Placeholder ABI files created!");
  process.exit(0);
}

// Use localhost as fallback for ABI if sepolia not deployed
const abiSource = deployLocalhost || deploySepolia;

if (deployLocalhost && deploySepolia) {
  if (
    JSON.stringify(deployLocalhost.abi) !== JSON.stringify(deploySepolia.abi)
  ) {
    console.error(
      `${line}Deployments on localhost and Sepolia differ. Can't use the same abi on both networks. Consider re-deploying the contracts on both networks.${line}`
    );
    process.exit(1);
  }
}

// Generate ABI TypeScript file
const tsCode = `/*
  This file is auto-generated.
  Command: 'npm run genabi'
*/
export const ${CONTRACT_NAME}ABI = ${JSON.stringify({ abi: abiSource.abi }, null, 2)} as const;
`;

// Generate addresses TypeScript file
const addresses = {};
if (deploySepolia) {
  addresses["11155111"] = {
    address: deploySepolia.address,
    chainId: 11155111,
    chainName: "sepolia",
  };
}
if (deployLocalhost) {
  addresses["31337"] = {
    address: deployLocalhost.address,
    chainId: 31337,
    chainName: "localhost",
  };
}

// Fallback for missing deployments
if (!addresses["11155111"]) {
  addresses["11155111"] = {
    address: "0x0000000000000000000000000000000000000000",
    chainId: 11155111,
    chainName: "sepolia",
  };
}
if (!addresses["31337"]) {
  addresses["31337"] = {
    address: "0x0000000000000000000000000000000000000000",
    chainId: 31337,
    chainName: "localhost",
  };
}

const tsAddresses = `/*
  This file is auto-generated.
  Command: 'npm run genabi'
*/
export const ${CONTRACT_NAME}Addresses = ${JSON.stringify(addresses, null, 2)};
`;

console.log(`Generated ${path.join(outdir, `${CONTRACT_NAME}ABI.ts`)}`);
console.log(`Generated ${path.join(outdir, `${CONTRACT_NAME}Addresses.ts`)}`);

fs.writeFileSync(
  path.join(outdir, `${CONTRACT_NAME}ABI.ts`),
  tsCode,
  "utf-8"
);
fs.writeFileSync(
  path.join(outdir, `${CONTRACT_NAME}Addresses.ts`),
  tsAddresses,
  "utf-8"
);

console.log("✅ ABI generation completed!");

