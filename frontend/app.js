const API = "http://localhost:3001";
const resultBox = document.getElementById("result");

function display(data) {
  resultBox.textContent = JSON.stringify(data, null, 2);
}

/* ISSUE CREDENTIAL */
async function issueCredential() {
  const payload = {
    studentName: document.getElementById("studentName").value,
    matricNo: document.getElementById("matricNo").value,
    course: document.getElementById("course").value,
    degree: document.getElementById("degree").value,
    year: document.getElementById("year").value
  };

  const res = await fetch(`${API}/issue-credential`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  display(await res.json());
}

/* MINE BLOCK */
async function mineBlock() {
  const res = await fetch(`${API}/mine`);
  display(await res.json());
}

/* VERIFY CREDENTIAL */
async function verifyCredential() {
  const matricNo = document.getElementById("verifyMatric").value;

  const res = await fetch(`${API}/verify-credential`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ matricNo })
  });

  display(await res.json());
}
