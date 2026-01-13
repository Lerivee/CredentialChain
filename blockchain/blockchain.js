const sha256 = require('sha256');
const { v4: uuidv4 } = require('uuid');

function Blockchain() {
  this.chain = [];
  this.pendingCredentials = [];
  this.networkNodes = [];

  this.createNewBlock(100, '0', '0');
}

/* CREATE BLOCK */
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

/* CREATE CREDENTIAL */
Blockchain.prototype.createNewCredential = function(
  studentName, matricNo, course, degree, year
) {
  if (!studentName || !matricNo || !course || !degree || !year) return null;

  const credential = {
    credentialId: uuidv4().split('-').join(''),
    studentName,
    matricNo,
    course,
    degree,
    year
  };

  this.pendingCredentials.push(credential);
  return this.getLastBlock().index + 1;
};

/* HASH BLOCK */
Blockchain.prototype.hashBlock = function(previousBlockHash, currentBlockData, nonce) {
  return sha256(previousBlockHash + nonce + JSON.stringify(currentBlockData));
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
  let found = null;
  this.chain.forEach(block => {
    block.credentials.forEach(c => {
      if (c.matricNo === matricNo) found = c;
    });
  });
  return found;
};

/* LAB 9 – CHAIN VALIDATION */
Blockchain.prototype.chainIsValid = function(blockchain) {
  let valid = true;

  for (let i = 1; i < blockchain.length; i++) {
    const current = blockchain[i];
    const prev = blockchain[i - 1];

    const hash = this.hashBlock(
      prev.hash,
      { credentials: current.credentials, index: current.index },
      current.nonce
    );

    if (hash.substring(0, 4) !== '0000') valid = false;
    if (current.previousBlockHash !== prev.hash) valid = false;
  }

  const genesis = blockchain[0];
  if (
    genesis.nonce !== 100 ||
    genesis.previousBlockHash !== '0' ||
    genesis.hash !== '0' ||
    genesis.credentials.length !== 0
  ) valid = false;

  return valid;
};

/* LAB 10 – GETTERS */
Blockchain.prototype.getBlock = function(hash) {
  return this.chain.find(b => b.hash === hash);
};

Blockchain.prototype.getCredential = function(id) {
  let credential = null;
  let block = null;

  this.chain.forEach(b => {
    b.credentials.forEach(c => {
      if (c.credentialId === id) {
        credential = c;
        block = b;
      }
    });
  });

  return { credential, block };
};

Blockchain.prototype.getStudentData = function(matricNo) {
  const creds = [];
  this.chain.forEach(b => {
    b.credentials.forEach(c => {
      if (c.matricNo === matricNo) creds.push(c);
    });
  });
  return { credentials: creds, total: creds.length };
};

module.exports = Blockchain;
