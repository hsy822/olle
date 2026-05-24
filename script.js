const header = document.querySelector("[data-header]");
const form = document.querySelector("[data-form]");
const total = document.querySelector("[data-total]");
const message = document.querySelector("[data-message]");
const quantityInput = form?.querySelector('input[name="quantity"]');
const PRICE = 28000;

const formatWon = (value) => `${value.toLocaleString("ko-KR")}원`;

function syncHeader() {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 24);
}

function syncTotal() {
  if (!quantityInput || !total) return;
  const quantity = Math.min(Math.max(Number(quantityInput.value) || 1, 1), 5);
  quantityInput.value = quantity;
  total.textContent = formatWon(quantity * PRICE);
}

window.addEventListener("scroll", syncHeader, { passive: true });
quantityInput?.addEventListener("input", syncTotal);

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const name = String(data.get("name") || "").trim();
  const contact = String(data.get("contact") || "").trim();
  const course = String(data.get("course") || "").trim();

  if (!name || !contact || !course) {
    message.textContent = "필수 정보를 모두 입력해주세요.";
    message.classList.remove("success");
    return;
  }

  message.textContent = `${name}님, 올레 자푸 프리오더 알림 신청이 접수되었습니다.`;
  message.classList.add("success");
  form.reset();
  syncTotal();
});

syncHeader();
syncTotal();
