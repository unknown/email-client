const btn = document.getElementById("btn");
const labelsElement = document.getElementById("labels");

if (btn && labelsElement) {
  btn.addEventListener("click", async () => {
    const labels = await window.gmail.getLabels();
    labelsElement.innerText = labels?.join(", ") ?? "";
  });
}
