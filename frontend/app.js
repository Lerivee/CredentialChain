const API = "http://localhost:3001";

/* ISSUE CREDENTIAL */
async function issueCredential() {
  const data = {
    studentName: document.getElementById("studentName").value,
    matricNo: document.getElementById("matricNo").value,
    course: document.getElementById("course").value,
    degree: document.getElementById("degree").value,
    year: document.getElementById("year").value
  };

  const res = await fetch(`${API}/issue-credential`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  const result = await res.json();
  document.getElementById("issueResult").innerText = result.note || result.error;
}

/* MINE BLOCK */
async function mineBlock() {
  const res = await fetch(`${API}/mine`);
  const result = await res.json();
  document.getElementById("mineResult").innerText =
    JSON.stringify(result, null, 2);
}

/* VERIFY CREDENTIAL */
async function verifyCredential() {
  const matricNo = document.getElementById("verifyMatric").value;

  const res = await fetch(`${API}/verify-credential`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ matricNo })
  });

  const result = await res.json();
  document.getElementById("verifyResult").innerText =
    JSON.stringify(result, null, 2);
}
