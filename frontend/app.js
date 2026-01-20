let provider;
let signer;
let contract;

/* PASTE YOUR ABI HERE */
const contractABI = [
  [
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "string",
				"name": "matricNo",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "studentName",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "course",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "degree",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "year",
				"type": "uint256"
			}
		],
		"name": "CredentialIssued",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_studentName",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_matricNo",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_course",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_degree",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "_year",
				"type": "uint256"
			}
		],
		"name": "issueCredential",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_matricNo",
				"type": "string"
			}
		],
		"name": "verifyCredential",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]
];

/* PASTE YOUR CONTRACT ADDRESS */
const contractAddress = "0xd9145CCE52D386f254917e481eB44e9943F39138";

async function connectBlockchain() {
  provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  signer = provider.getSigner();
  contract = new ethers.Contract(contractAddress, contractABI, signer);
}

/* ISSUE CREDENTIAL ON-CHAIN */
async function issueCredential() {
  await connectBlockchain();

  const studentName = document.getElementById("studentName").value;
  const matricNo = document.getElementById("matricNo").value;
  const course = document.getElementById("course").value;
  const degree = document.getElementById("degree").value;
  const year = document.getElementById("year").value;

  const tx = await contract.issueCredential(
    studentName,
    matricNo,
    course,
    degree,
    year
  );

  await tx.wait();
  alert("Credential successfully stored on blockchain");
}

/* VERIFY CREDENTIAL */
async function verifyCredential() {
  await connectBlockchain();

  const matricNo = document.getElementById("verifyMatric").value;

  const data = await contract.verifyCredential(matricNo);

  document.getElementById("result").textContent = JSON.stringify({
    studentName: data[0],
    matricNo: data[1],
    course: data[2],
    degree: data[3],
    year: data[4]
  }, null, 2);
}
