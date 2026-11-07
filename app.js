const tg = window.Telegram?.WebApp;
const $ = (id) => document.getElementById(id);

// Говорим Telegram, что апка готова, и раскрываем её на весь экран
if (tg) {
  tg.ready();
  tg.expand();
  tg.setHeaderColor("#0e1012");
  tg.setBackgroundColor("#0e1012");
}

// Telegram сам передаёт, кто открыл апку. Вне Telegram этих данных нет.
const user = tg?.initDataUnsafe?.user;
$("hello").textContent = user
  ? `Привет, ${user.first_name}`
  : "Открыто не в Telegram";

function tap() {
  tg?.HapticFeedback?.impactOccurred("light");
}

function show(id) {
  for (const el of document.querySelectorAll(".splash, .screen")) el.hidden = el.id !== id;
  // Системная кнопка «Назад» в шапке Telegram видна только внутри раздела
  if (tg) id === "section" ? tg.BackButton.show() : tg.BackButton.hide();
  window.scrollTo(0, 0);
}

function renderHome() {
  $("sections").replaceChildren(
    ...window.CONTENT.map((s) => {
      const card = document.createElement("button");
      card.className = "card";
      card.innerHTML = `<span class="card-title"></span><span class="card-hint"></span><span class="card-count"></span>`;
      card.querySelector(".card-title").textContent = s.title;
      card.querySelector(".card-hint").textContent = s.hint;
      card.querySelector(".card-count").textContent = s.items.length ? `[ ${s.items.length} ]` : "[ скоро ]";
      card.onclick = () => { tap(); openSection(s.id); };
      return card;
    })
  );
}

function renderItem(item) {
  const box = document.createElement("article");
  box.className = "item";
  const h = document.createElement("h3");
  h.textContent = item.title;
  box.append(h);

  if (item.text) {
    const p = document.createElement("p");
    p.className = "item-text";
    p.textContent = item.text;
    box.append(p);
  }
  if (item.prompt) {
    const pre = document.createElement("pre");
    pre.textContent = item.prompt;
    const btn = document.createElement("button");
    btn.className = "action";
    btn.textContent = "Скопировать";
    btn.onclick = async () => {
      await navigator.clipboard.writeText(item.prompt);
      tg?.HapticFeedback?.notificationOccurred("success");
      btn.textContent = "Скопировано";
    };
    box.append(pre, btn);
  }
  if (item.url) {
    const btn = document.createElement("button");
    btn.className = "action";
    btn.textContent = "Открыть";
    // Ссылки t.me открываем внутри Telegram, остальные во встроенном браузере
    btn.onclick = () => {
      tap();
      if (!tg) return window.open(item.url, "_blank");
      item.url.startsWith("https://t.me/") ? tg.openTelegramLink(item.url) : tg.openLink(item.url);
    };
    box.append(btn);
  }
  return box;
}

function openSection(id) {
  const s = window.CONTENT.find((x) => x.id === id);
  if (!s) return show("home");
  $("section-title").textContent = s.title;
  const list = $("section-list");
  if (s.items.length) {
    list.replaceChildren(...s.items.map(renderItem));
  } else {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = "Здесь пока пусто. Скоро появится.";
    list.replaceChildren(empty);
  }
  show("section");
}

tg?.BackButton.onClick(() => { tap(); show("home"); });

renderHome();
setTimeout(() => {
  // Ссылка вида t.me/бот/app?startapp=prompts откроет сразу раздел «Промпты»
  const start = tg?.initDataUnsafe?.start_param;
  start ? openSection(start) : show("home");
}, 1400);
