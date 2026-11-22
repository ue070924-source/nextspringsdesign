const inquiryForm = document.getElementById("inquiry-form");
const reviewDialog = document.getElementById("inquiry-review");
const reviewMessage = document.getElementById("inquiry-review-message");
const reviewHelp = document.getElementById("inquiry-review-help");
const reviewStatus = document.getElementById("inquiry-review-status");
const sendLink = document.getElementById("inquiry-send");
const copyButton = document.getElementById("inquiry-copy");
const mailboxLink = document.getElementById("inquiry-email").getAttribute("href");

const nameField = document.getElementById("inquiry-name");
const messageField = document.getElementById("inquiry-message");

for (const field of [nameField, messageField]) {
  field.addEventListener("input", () => field.setCustomValidity(""));
}

inquiryForm.addEventListener("submit", (event) => {
  event.preventDefault();

  nameField.setCustomValidity(nameField.value.trim() ? "" : "お名前を入力してください。");
  messageField.setCustomValidity(messageField.value.trim() ? "" : "ご相談内容を入力してください。");

  if (!inquiryForm.reportValidity()) {
    return;
  }

  const fields = new FormData(inquiryForm);
  const message = [
    ["つくりたいもの", fields.get("project")],
    ["お名前", nameField.value.trim()],
    ["会社名・屋号", fields.get("company").trim()],
    ["返信先メールアドレス", fields.get("email").trim()],
    ["現在のサイトURL", fields.get("currentSite").trim()],
    ["ご予算の目安", fields.get("budget")],
    ["あわせて相談したいこと", fields.getAll("topics").join("、")],
    ["ご相談内容", "\r\n" + messageField.value.trim()],
  ]
    .filter(([, value]) => value)
    .map(([label, value]) => `${label}：${value}`)
    .join("\r\n");

  const subject = encodeURIComponent("NextSpringsへのWeb制作のご相談");
  const mailLink = `${mailboxLink}?subject=${subject}`;
  const mailWithBody = `${mailLink}&body=${encodeURIComponent(message)}`;
  // 長い本文は一部のメールアプリで切れるため、コピーして貼り付けられるようにする。
  const canIncludeBody = mailWithBody.length <= 2000;

  reviewMessage.value = message;
  sendLink.href = canIncludeBody ? mailWithBody : mailLink;
  reviewHelp.textContent = canIncludeBody
    ? "内容を確認して、メールアプリで送信してください。"
    : "本文が長いため、下の「本文をコピー」を押して、メールアプリに貼り付けてください。";
  reviewStatus.textContent = "";
  reviewDialog.showModal();
  document.getElementById("inquiry-review-heading").focus();
});

copyButton.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(reviewMessage.value);
    reviewStatus.textContent = "メールの本文をコピーしました。";
  } catch {
    reviewMessage.focus();
    reviewMessage.select();
    reviewStatus.textContent = "選択された本文をコピーしてください。";
  }
});

inquiryForm.querySelector('button[type="submit"]').disabled = false;
