const sha256 = require('sha256');
const { v4: uuidv4 } = require('uuid');

function Blockchain() {
  this.chain = [];
  this.pendingCredentials = [];
  this.currentNodeUrl = process.argv[3];
  this.networkNodes = [];

  this.createNewBlock(100, '0', '0');
}

/* CREATE NEW BLOCK */
Blockchain.prototype.createNewBlock = function(nonce, previousBlockHash, hash) {
  const newBlock = {
    index: this.chain.length + 1,
    timestamp: Date.now(),
    credentials: this.pendingCredentials,
    nonce,
    hash,
    previousBlockHash
  };

  this.pendingCredentials = [];
  this.chain.push(newBlock);
  return newBlock;
};

/* GET LAST BLOCK */
Blockchain.prototype.getLastBlock = function() {
  return this.chain[this.chain.length - 1];
};

/* CREATE NEW CREDENTIAL */
Blockchain.prototype.createNewCredential = function(
  studentName,
  matricNo,
  course,
  degree,
  year
) {
  const newCredential = {
    credentialId: uuidv4().split('-').join(''),
    studentName,
    matricNo,
    course,
    degree,
    year
  };

  this.pendingCredentials.push(newCredential);
  return this.getLastBlock()['index'] + 1;
};

/* HASH BLOCK */
Blockchain.prototype.hashBlock = function(previousBlockHash, currentBlockData, nonce) {
  const dataAsString =
    previousBlockHash + nonce.toString() + JSON.stringify(currentBlockData);
  return sha256(dataAsString);
};

/* PROOF OF WORK */
Blockchain.prototype.proofOfWork = function(previousBlockHash, currentBlockData) {
  let nonce = 0;
  let hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);

  while (hash.substring(0, 4) !== '0000') {
    nonce++;
    hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
  }

  return nonce;
};

/* VERIFY CREDENTIAL */
Blockchain.prototype.verifyCredential = function(matricNo) {
  let foundCredential = null;

  this.chain.forEach(block => {
    block.credentials.forEach(cred => {
      if (cred.matricNo === matricNo) {
        foundCredential = cred;
      }
    });
  });

  return foundCredential;
};

module.exports = Blockchain;
