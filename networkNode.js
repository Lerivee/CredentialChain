const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const rp = require('request-promise');
const Blockchain = require('./blockchain/blockchain');

const app = express();
const port = process.argv[2];
const chain = new Blockchain();

app.use(bodyParser.json());
app.use(cors());

/* VIEW BLOCKCHAIN */
app.get('/blockchain', (req, res) => res.json(chain));

/* ISSUE CREDENTIAL */
app.post('/issue-credential', (req, res) => {
  const index = chain.createNewCredential(
    req.body.studentName,
    req.body.matricNo,
    req.body.course,
    req.body.degree,
    req.body.year
  );

  if (!index) return res.status(400).json({ error: 'Incomplete data' });
  res.json({ note: `Credential will be added to block ${index}` });
});

/* MINE */
app.get('/mine', (req, res) => {
  const last = chain.getLastBlock();
  const nonce = chain.proofOfWork(last.hash, {
    credentials: chain.pendingCredentials,
    index: last.index + 1
  });

  const hash = chain.hashBlock(last.hash, {
    credentials: chain.pendingCredentials,
    index: last.index + 1
  }, nonce);

  const block = chain.createNewBlock(nonce, last.hash, hash);
  res.json({ note: 'Block mined', block });
});

/* VERIFY */
app.post('/verify-credential', (req, res) => {
  const cred = chain.verifyCredential(req.body.matricNo);
  res.json(cred ? { valid: true, credential: cred } : { valid: false });
});

/* LAB 9 – CONSENSUS */
app.get('/consensus', (req, res) => {
  const promises = chain.networkNodes.map(url =>
    rp({ uri: url + '/blockchain', json: true })
  );

  Promise.all(promises).then(blockchains => {
    let maxLength = chain.chain.length;
    let newChain = null;

    blockchains.forEach(bc => {
      if (bc.chain.length > maxLength && chain.chainIsValid(bc.chain)) {
        maxLength = bc.chain.length;
        newChain = bc.chain;
      }
    });

    if (newChain) {
      chain.chain = newChain;
      res.json({ note: 'Chain replaced', chain: chain.chain });
    } else {
      res.json({ note: 'Current chain is valid', chain: chain.chain });
    }
  });
});

/* LAB 10 – EXPLORER ROUTES */
app.get('/block/:hash', (req, res) =>
  res.json({ block: chain.getBlock(req.params.hash) })
);

app.get('/credential/:id', (req, res) =>
  res.json(chain.getCredential(req.params.id))
);

app.get('/student/:matricNo', (req, res) =>
  res.json(chain.getStudentData(req.params.matricNo))
);

app.listen(port, () =>
  console.log(`CredentialChain running on port ${port}`)
);
