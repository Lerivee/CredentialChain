const express = require('express');
const bodyParser = require('body-parser');
const rp = require('request-promise');
const Blockchain = require('./blockchain/blockchain');

const app = express();
const port = process.argv[2];

const credentialChain = new Blockchain();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

/* VIEW BLOCKCHAIN */
app.get('/blockchain', function(req, res) {
  res.send(credentialChain);
});

/* ISSUE CREDENTIAL */
app.post('/issue-credential', function(req, res) {
  const blockIndex = credentialChain.createNewCredential(
    req.body.studentName,
    req.body.matricNo,
    req.body.course,
    req.body.degree,
    req.body.year
  );

  res.json({
    note: `Credential will be added to block ${blockIndex}`
  });
});

/* MINE BLOCK */
app.get('/mine', function(req, res) {
  const lastBlock = credentialChain.getLastBlock();
  const previousBlockHash = lastBlock['hash'];

  const currentBlockData = {
    credentials: credentialChain.pendingCredentials,
    index: lastBlock['index'] + 1
  };

  const nonce = credentialChain.proofOfWork(previousBlockHash, currentBlockData);
  const blockHash = credentialChain.hashBlock(previousBlockHash, currentBlockData, nonce);

  const newBlock = credentialChain.createNewBlock(
    nonce,
    previousBlockHash,
    blockHash
  );

  res.json({
    note: 'New credential block mined successfully',
    block: newBlock
  });
});

/* VERIFY CREDENTIAL */
app.post('/verify-credential', function(req, res) {
  const credential = credentialChain.verifyCredential(req.body.matricNo);

  if (credential) {
    res.json({
      valid: true,
      credential
    });
  } else {
    res.json({
      valid: false,
      message: 'Credential not found'
    });
  }
});

/* REGISTER NODE */
app.post('/register-node', function(req, res) {
  const newNodeUrl = req.body.newNodeUrl;

  if (
    credentialChain.networkNodes.indexOf(newNodeUrl) === -1 &&
    credentialChain.currentNodeUrl !== newNodeUrl
  ) {
    credentialChain.networkNodes.push(newNodeUrl);
  }

  res.json({ note: 'Node registered successfully.' });
});

/* REGISTER AND BROADCAST NODE */
app.post('/register-and-broadcast-node', function(req, res) {
  const newNodeUrl = req.body.newNodeUrl;

  if (credentialChain.networkNodes.indexOf(newNodeUrl) === -1) {
    credentialChain.networkNodes.push(newNodeUrl);
  }

  const regNodesPromises = [];
  credentialChain.networkNodes.forEach(networkNodeUrl => {
    const requestOptions = {
      uri: networkNodeUrl + '/register-node',
      method: 'POST',
      body: { newNodeUrl },
      json: true
    };
    regNodesPromises.push(rp(requestOptions));
  });

  Promise.all(regNodesPromises).then(() => {
    const bulkRegisterOptions = {
      uri: newNodeUrl + '/register-nodes-bulk',
      method: 'POST',
      body: {
        allNetworkNodes: [
          ...credentialChain.networkNodes,
          credentialChain.currentNodeUrl
        ]
      },
      json: true
    };
    return rp(bulkRegisterOptions);
  }).then(() => {
    res.json({ note: 'New node registered with network successfully.' });
  });
});

/* REGISTER NODES BULK */
app.post('/register-nodes-bulk', function(req, res) {
  const allNetworkNodes = req.body.allNetworkNodes;

  allNetworkNodes.forEach(networkNodeUrl => {
    if (
      credentialChain.networkNodes.indexOf(networkNodeUrl) === -1 &&
      credentialChain.currentNodeUrl !== networkNodeUrl
    ) {
      credentialChain.networkNodes.push(networkNodeUrl);
    }
  });

  res.json({ note: 'Bulk registration successful.' });
});

app.listen(port, function() {
  console.log(`CredentialChain node running on port ${port}`);
});
