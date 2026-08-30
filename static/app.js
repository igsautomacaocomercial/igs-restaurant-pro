const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

const statusLabel = {
  free: "Livre",
  occupied: "Ocupada",
  reserved: "Reservada",
  closing: "Fechamento",
  pending: "Pendente",
  out_for_delivery: "Em rota",
  delivered: "Entregue",
  paid: "Pago",
  open: "Aberto",
  overdue: "Vencido",
};

const pdvState = {
  items: [
    { name: "X-Burger Artesanal", qty: 1, price: 29.9 },
    { name: "Refrigerante Lata", qty: 2, price: 7 },
  ],
  selectedIndex: 0,
  discount: 0,
  surcharge: 0,
  selectedPayment: "Dinheiro",
  payments: [],
  paymentContext: "pdv",
  servicePayment: null,
  lastReceiptNumber: 128,
};

const serviceState = {
  current: null,
  tables: [],
  tabs: [],
  category: "AGUA",
};

const deliveryState = {
  customers: [
    { id: 45, name: "ISMAEL", phone: "33999990001", address: "Rua Paqueta", number: "211", district: "Giovanni", city: "Coronel Fabriciano", state: "MG", reference: "Av. 28 de Abril", fee: 11, credit: 0, points: 0 },
    { id: 46, name: "MARIANA LOPES", phone: "33988887070", address: "Rua das Flores", number: "120", district: "Bethania", city: "Ipatinga", state: "MG", reference: "Casa", fee: 5, credit: 0, points: 12 },
  ],
  orders: [
    { id: 62018, customerId: 45, customer: "ISMAEL", phone: "33999990001", address: "Rua Paqueta, 211", district: "Giovanni", fee: 11, status: "pending", courier: "", payment: "Dinheiro", items: [{ name: "AGUA MIN C/GAS 500ML PET GOLD", qty: 1, price: 4, sector: "Copa" }], createdAt: "09/05/2026 08:31", scheduled: false },
    { id: 62019, customerId: 46, customer: "MARIANA LOPES", phone: "33988887070", address: "Rua das Flores, 120", district: "Bethania", fee: 5, status: "out_for_delivery", courier: "Rafa", payment: "PIX", items: [{ name: "X-BURGER ARTESANAL", qty: 2, price: 29.9, sector: "Cozinha" }], createdAt: "09/05/2026 08:42", scheduled: false },
  ],
  selectedCustomerId: null,
  selectedOrderId: 62018,
  activeTab: "pending",
  draft: null,
  cashEntries: [],
};

const serviceCatalog = [
  { category: "AGUA", name: "AGUA MIN C/GAS 500ML PET GOLD", price: 4, icon: "droplets", sector: "Copa" },
  { category: "SUCOS", name: "SUCO NATURAL LARANJA", price: 12, icon: "cup-soda", sector: "Copa" },
  { category: "REFRIGERANTES", name: "REFRIGERANTE LATA", price: 7, icon: "cup-soda", sector: "Bar" },
  { category: "PIZZA", name: "PIZZA CALABRESA", price: 54.9, icon: "pizza", sector: "Cozinha" },
  { category: "LANCHES", name: "X-BURGER ARTESANAL", price: 29.9, icon: "sandwich", sector: "Cozinha" },
  { category: "PORCOES", name: "BATATA CHEDDAR", price: 32, icon: "utensils", sector: "Cozinha" },
  { category: "SORVETE", name: "SORVETE 2 BOLAS", price: 14, icon: "ice-cream-cone", sector: "Copa" },
  { category: "BALAS", name: "BALAS SORTIDAS", price: 2.5, icon: "candy", sector: "Caixa" },
];

const defaultProductGroups = [
  { code: "001", name: "AGUA", type: "Bebidas", sector: "Copa", icon: "droplets", order: 1, status: "Ativo", products: 6, notes: "Agua mineral, com gas e sem gas." },
  { code: "002", name: "SUCOS", type: "Bebidas", sector: "Copa", icon: "cup-soda", order: 2, status: "Ativo", products: 12, notes: "Sucos naturais, polpas e vitaminas." },
  { code: "003", name: "REFRIGERANTES", type: "Bebidas", sector: "Bar", icon: "cup-soda", order: 3, status: "Ativo", products: 18, notes: "Latas, garrafas e combos." },
  { code: "004", name: "PIZZA", type: "Alimentos", sector: "Cozinha", icon: "pizza", order: 4, status: "Ativo", products: 24, notes: "Pizzas grandes, brotinhos e adicionais." },
  { code: "005", name: "LANCHES", type: "Alimentos", sector: "Cozinha", icon: "sandwich", order: 5, status: "Ativo", products: 20, notes: "Hamburgueres, sanduiches e hot dogs." },
  { code: "006", name: "PORCOES", type: "Alimentos", sector: "Cozinha", icon: "utensils", order: 6, status: "Ativo", products: 14, notes: "Batata, mandioca, carnes e porcoes mistas." },
  { code: "007", name: "SORVETE", type: "Sobremesas", sector: "Copa", icon: "ice-cream-cone", order: 7, status: "Ativo", products: 10, notes: "Potes, bolas, casquinhas e sobremesas geladas." },
  { code: "008", name: "BALAS", type: "Bomboniere", sector: "Caixa", icon: "candy", order: 8, status: "Ativo", products: 16, notes: "Balas, chicletes e produtos de impulso no caixa." },
];

let productGroups = [];

const isMobileNav = () => window.matchMedia("(max-width: 760px)").matches;

function setMobileMenu(open) {
  document.body.classList.toggle("menu-open", open);
  const button = document.querySelector(".menu-toggle");
  if (button) {
    button.setAttribute("aria-expanded", String(open));
  }
}

function closeAllMenuGroups() {
  document.querySelectorAll(".nav-group.open").forEach((group) => {
    group.classList.remove("open");
    const toggle = group.querySelector("[data-menu-toggle]");
    toggle?.setAttribute("aria-expanded", "false");
    toggle?.classList.remove("active");
    toggle?.removeAttribute("aria-current");
  });
}

function openMenuGroup(group) {
  if (!group) return;
  closeAllMenuGroups();
  group.classList.add("open");
  const toggle = group.querySelector("[data-menu-toggle]");
  toggle?.setAttribute("aria-expanded", "true");
}

function toggleMenuGroup(group) {
  if (!group) return;
  const open = !group.classList.contains("open");
  if (open) {
    openMenuGroup(group);
  } else {
    closeAllMenuGroups();
  }

  const toggle = group.querySelector("[data-menu-toggle]");
  toggle?.setAttribute("aria-expanded", String(open));
  toggle?.classList.toggle("active", open);
  if (!open) {
    toggle?.removeAttribute("aria-current");
  }
}

const districtNames = {
  5: "Bethânia",
  10: "Centro",
  7: "Caravelas",
};

function setView(viewName) {
  const view = document.getElementById(viewName);
  if (!view) return;

  document.querySelectorAll(".view").forEach((item) => item.classList.remove("active"));
  document.querySelectorAll("[data-nav-item]").forEach((item) => {
    item.classList.remove("active");
    item.removeAttribute("aria-current");
  });

  view.classList.add("active");
  document.querySelectorAll(`[data-nav-item][data-view="${viewName}"]`).forEach((item) => {
    item.classList.add("active");
    item.setAttribute("aria-current", "page");
  });

  const activeGroup = document.querySelector(`.submenu [data-view="${viewName}"]`)?.closest(".nav-group");
  closeAllMenuGroups();
  if (activeGroup) {
    activeGroup.classList.add("open");
    const toggle = activeGroup.querySelector("[data-menu-toggle]");
    toggle?.classList.add("active");
    toggle?.setAttribute("aria-expanded", "true");
    toggle?.setAttribute("aria-current", "location");
  }

  if (isMobileNav()) {
    setMobileMenu(false);
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function bindNavigation() {
  document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => setView(button.dataset.view));
  });

  document.querySelectorAll("[data-menu-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const group = button.closest(".nav-group");
      toggleMenuGroup(group);
    });
  });

  document.querySelector(".menu-toggle")?.addEventListener("click", () => {
    setMobileMenu(!document.body.classList.contains("menu-open"));
  });

  document.querySelector('[data-action="refresh"]')?.addEventListener("click", async () => {
    await boot();
    const button = document.querySelector('[data-action="refresh"]');
    button.classList.add("spin-once");
    setTimeout(() => button.classList.remove("spin-once"), 700);
  });

  document.querySelectorAll(".print-sector-card").forEach((card) => {
    card.addEventListener("click", () => {
      document.querySelectorAll(".print-sector-card").forEach((item) => item.classList.remove("active"));
      card.classList.add("active");
      card.querySelector("input").checked = true;
    });
  });

  document.querySelectorAll("[data-pdv-add]").forEach((button) => {
    button.addEventListener("click", () => {
      addPdvItem(button.dataset.pdvAdd, Number(button.dataset.price));
    });
  });

  document.querySelectorAll("[data-pdv-action]").forEach((button) => {
    button.addEventListener("click", () => handlePdvAction(button.dataset.pdvAction));
  });

  document.querySelectorAll("[data-payment-method]").forEach((button) => {
    button.addEventListener("click", () => {
      pdvState.selectedPayment = button.dataset.paymentMethod;
      document.querySelectorAll("[data-payment-method]").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      fillRemainingPayment();
      setPdvMessage(`Forma selecionada: ${pdvState.selectedPayment}.`);
    });
  });

  document.getElementById("customer-district")?.addEventListener("change", updateCustomerDeliveryFee);
  document.getElementById("customer-order-value")?.addEventListener("input", updateCustomerDeliveryFee);
  document.getElementById("delivery-board-filter")?.addEventListener("input", renderDeliveryBoard);

  document.querySelectorAll("[data-generator]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.generator === "tables") generateTables();
      if (button.dataset.generator === "tabs") generateTabs();
    });
  });

  document.querySelectorAll("[data-receipt-action]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.receiptAction === "print") window.print();
      if (button.dataset.receiptAction === "close") closeReceipt();
    });
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".main-nav") && !event.target.closest(".menu-toggle")) {
      setMobileMenu(false);
      closeAllMenuGroups();
    }

    const serviceOpen = event.target.closest("[data-open-service]");
    if (serviceOpen) {
      openService(serviceOpen.dataset.serviceType, Number(serviceOpen.dataset.serviceIndex));
      return;
    }
    const serviceAction = event.target.closest("[data-service-action]");
    if (serviceAction) handleServiceAction(serviceAction.dataset.serviceAction, event);

    const groupAction = event.target.closest("[data-group-action]");
    if (groupAction) handleGroupAction(groupAction.dataset.groupAction, event);

    const deliveryAction = event.target.closest("[data-delivery-action]");
    if (deliveryAction) handleDeliveryAction(deliveryAction.dataset.deliveryAction, event);

    const deliveryTab = event.target.closest("[data-delivery-tab]");
    if (deliveryTab) {
      deliveryState.activeTab = deliveryTab.dataset.deliveryTab;
      renderDeliveryBoard();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setMobileMenu(false);
      closeAllMenuGroups();
    }
  });

  window.addEventListener("resize", () => {
    if (!isMobileNav()) {
      setMobileMenu(false);
    }
  });
}

function generateTables() {
  const count = Number(document.getElementById("table-count")?.value || 0);
  const prefix = document.getElementById("table-prefix")?.value || "Mesa";
  const seats = document.getElementById("table-seats")?.value || "4";
  const target = document.getElementById("generated-tables");
  if (!target) return;
  const tables = Array.from({ length: Math.max(0, Math.min(count, 80)) }, (_, index) => ({
    code: String(index + 1).padStart(2, "0"),
    seats: Number(seats) || 4,
    status: "free",
    waiter: null,
    total: 0,
    minutes: 0,
  }));
  target.innerHTML = tables.map((table) => {
    const code = table.code;
    return `<article><strong>${prefix} ${code}</strong><span>${table.seats} lugares</span><em>Livre</em></article>`;
  }).join("");
  localStorage.setItem("igs_tables", JSON.stringify(tables));
  renderTables(tables);
}

function getStoredTables(fallback) {
  try {
    const stored = JSON.parse(localStorage.getItem("igs_tables") || "null");
    return Array.isArray(stored) && stored.length ? stored : fallback;
  } catch {
    return fallback;
  }
}

function generateTabs() {
  const count = Number(document.getElementById("tab-count")?.value || 0);
  const start = Number(document.getElementById("tab-start")?.value || 1);
  const prefix = document.getElementById("tab-prefix")?.value || "";
  const type = document.getElementById("tab-type")?.value || "Física";
  const target = document.getElementById("generated-tabs");
  if (!target) return;
  const tabs = Array.from({ length: Math.max(0, Math.min(count, 200)) }, (_, index) => ({
    code: `${prefix}${String(start + index).padStart(3, "0")}`,
    type,
    status: "Livre",
  }));
  target.innerHTML = tabs.map((tab) => `<article><strong>${tab.code}</strong><span>${tab.type}</span><em>${tab.status}</em></article>`).join("");
  localStorage.setItem("igs_tabs", JSON.stringify(tabs));
  serviceState.tabs = tabs.map((tab) => ({
    code: tab.code,
    tab_type: tab.type,
    status: "free",
    customer_name: null,
    total: 0,
    minutes: 0,
    items: [],
  }));
  localStorage.setItem("igs_service_tabs", JSON.stringify(serviceState.tabs));
  renderServiceTabs();
}

function restoreGeneratedTabs() {
  const target = document.getElementById("generated-tabs");
  if (!target) return;
  try {
    const tabs = JSON.parse(localStorage.getItem("igs_tabs") || "[]");
    if (Array.isArray(tabs) && tabs.length) {
      target.innerHTML = tabs.map((tab) => `<article><strong>${tab.code}</strong><span>${tab.type}</span><em>${tab.status}</em></article>`).join("");
    }
  } catch {
    target.innerHTML = "";
  }
}

function loadServiceTabs() {
  try {
    const stored = JSON.parse(localStorage.getItem("igs_service_tabs") || "null");
    if (Array.isArray(stored) && stored.length) return stored;
  } catch {
    return [];
  }
  return Array.from({ length: 12 }, (_, index) => ({
    code: `C${String(index + 1).padStart(3, "0")}`,
    tab_type: "Física",
    status: index === 0 ? "open" : "free",
    customer_name: index === 0 ? "Cliente balcão" : null,
    total: index === 0 ? 43.9 : 0,
    minutes: index === 0 ? 12 : 0,
    items: index === 0 ? [{ name: "X-Burger Artesanal", qty: 1, price: 29.9 }, { name: "Refrigerante Lata", qty: 2, price: 7 }] : [],
  }));
}

function loadProductGroups() {
  try {
    const stored = JSON.parse(localStorage.getItem("igs_product_groups") || "null");
    if (Array.isArray(stored) && stored.length) return stored;
  } catch {
    return defaultProductGroups;
  }
  return defaultProductGroups;
}

function saveProductGroups() {
  localStorage.setItem("igs_product_groups", JSON.stringify(productGroups));
}

function setGroupForm(group = null) {
  const nextCode = String((productGroups.length || 0) + 1).padStart(3, "0");
  const data = group || {
    code: nextCode,
    name: "",
    type: "Bebidas",
    sector: "Copa",
    icon: "cup-soda",
    order: productGroups.length + 1,
    status: "Ativo",
    notes: "",
  };
  document.getElementById("group-code").value = data.code || nextCode;
  document.getElementById("group-name").value = data.name || "";
  document.getElementById("group-type").value = data.type || "Bebidas";
  document.getElementById("group-sector").value = data.sector || "Copa";
  document.getElementById("group-icon").value = data.icon || "cup-soda";
  document.getElementById("group-status").value = data.status || "Ativo";
  document.getElementById("group-order").value = data.order || productGroups.length + 1;
  document.getElementById("group-notes").value = data.notes || "";
}

function readGroupForm() {
  return {
    code: document.getElementById("group-code")?.value.trim() || String(productGroups.length + 1).padStart(3, "0"),
    name: (document.getElementById("group-name")?.value.trim() || "NOVO GRUPO").toUpperCase(),
    type: document.getElementById("group-type")?.value || "Bebidas",
    sector: document.getElementById("group-sector")?.value || "Copa",
    icon: document.getElementById("group-icon")?.value || "cup-soda",
    status: document.getElementById("group-status")?.value || "Ativo",
    order: Number(document.getElementById("group-order")?.value || productGroups.length + 1),
    notes: document.getElementById("group-notes")?.value || "",
    products: Number(productGroups.find((item) => item.code === document.getElementById("group-code")?.value.trim())?.products || 0),
  };
}

function handleGroupAction(action, event) {
  if (action === "new") {
    setGroupForm();
    document.getElementById("group-name")?.focus();
    return;
  }
  if (action === "edit") {
    const code = event.target.closest("[data-group-code]")?.dataset.groupCode;
    const group = productGroups.find((item) => item.code === code);
    if (group) setGroupForm(group);
    return;
  }
  if (action === "delete") {
    const code = event.target.closest("[data-group-code]")?.dataset.groupCode;
    productGroups = productGroups.filter((item) => item.code !== code);
    saveProductGroups();
    renderProductGroups();
    return;
  }
  if (action === "save") {
    const group = readGroupForm();
    const index = productGroups.findIndex((item) => item.code === group.code);
    if (index >= 0) productGroups[index] = { ...productGroups[index], ...group };
    else productGroups.push(group);
    productGroups.sort((a, b) => Number(a.order || 0) - Number(b.order || 0));
    saveProductGroups();
    renderProductGroups();
  }
}

function ensureServiceModal() {
  if (document.getElementById("service-overlay")) return;
  document.body.insertAdjacentHTML("beforeend", `
    <div class="service-overlay" id="service-overlay" aria-hidden="true">
      <section class="service-modal">
        <header><div><p class="eyebrow" id="service-kind">Atendimento</p><h2 id="service-title">Mesa 01</h2></div><button class="icon-btn" data-service-action="close-modal" title="Fechar"><i data-lucide="x"></i></button></header>
        <div class="service-body">
          <section class="service-ticket"><div class="service-status-line"><span class="status free" id="service-status">Livre</span><strong id="service-total">R$ 0,00</strong></div><div class="service-items" id="service-items"></div></section>
          <aside class="service-actions-panel">
            <div class="service-launch">
              <label>Produto<select id="service-product"><option value="X-Burger Artesanal|29.9">X-Burger Artesanal - R$ 29,90</option><option value="Pizza Calabresa|54.9">Pizza Calabresa - R$ 54,90</option><option value="Batata Cheddar|32">Batata Cheddar - R$ 32,00</option><option value="Refrigerante Lata|7">Refrigerante Lata - R$ 7,00</option><option value="Suco Natural|12">Suco Natural - R$ 12,00</option></select></label>
              <label>Quantidade<input id="service-qty" value="1" /></label>
              <label>Observação<input id="service-note" placeholder="Ex: sem cebola, ponto da carne..." /></label>
              <button class="primary-btn" data-service-action="launch-item"><i data-lucide="plus"></i><span>Lançar item</span></button>
              <p class="service-lock-message" id="service-lock-message"></p>
            </div>
            <div class="service-action-grid">
              <button data-service-action="open"><i data-lucide="play"></i><span>Abrir</span></button><button data-service-action="reserve"><i data-lucide="calendar-check"></i><span>Reservar</span></button><button data-service-action="bill"><i data-lucide="receipt-text"></i><span>Pedir conta</span></button><button data-service-action="reopen"><i data-lucide="undo-2"></i><span>Reabrir</span></button><button data-service-action="finish"><i data-lucide="check-circle-2"></i><span>Finalizar</span></button><button data-service-action="cancel"><i data-lucide="ban"></i><span>Cancelar</span></button>
            </div>
            <div class="service-transfer"><label>Transferir ou juntar com<input id="service-transfer-target" placeholder="Ex: 08 ou C012" /></label><button class="ghost-btn" data-service-action="transfer"><i data-lucide="move-right"></i><span>Transferir</span></button><button class="ghost-btn" data-service-action="merge"><i data-lucide="combine"></i><span>Juntar</span></button></div>
          </aside>
        </div>
      </section>
    </div>
  `);
}

function ensureServiceModal() {
  if (document.getElementById("service-overlay")) return;
  document.body.insertAdjacentHTML("beforeend", `
    <div class="service-overlay" id="service-overlay" aria-hidden="true">
      <section class="service-modal service-modal-pro">
        <header>
          <div><p class="eyebrow" id="service-kind">Atendimento</p><h2 id="service-title">Mesa 01</h2></div>
          <div class="service-header-meta">
            <span>Venda <strong id="service-sale-number">62017</strong></span>
            <span id="service-opened-at"></span>
            <button class="icon-btn" data-service-action="close-modal" title="Fechar"><i data-lucide="x"></i></button>
          </div>
        </header>
        <div class="service-body service-body-pro">
          <section class="service-ticket">
            <div class="service-status-line"><span class="status free" id="service-status">Livre</span><strong id="service-total">R$ 0,00</strong></div>
            <div class="service-quick-entry">
              <label>Produto<select id="service-product"></select></label>
              <label>Qtde.<input id="service-qty" value="1" /></label>
              <label>Obs.<input id="service-note" placeholder="Ex: sem cebola, ponto da carne..." /></label>
              <button class="primary-btn" data-service-action="launch-item"><i data-lucide="plus"></i><span>Lancar</span></button>
            </div>
            <div class="service-items-head"><span>Produto</span><span>Vl. Unit.</span><span>Qtd.</span><span>Total</span><span></span></div>
            <div class="service-items" id="service-items"></div>
            <div class="service-summary-strip">
              <label>Qtde. itens<input id="service-summary-items" value="0" readonly /></label>
              <label>Qtde. pessoas<input id="service-people" value="1" /></label>
              <label>Desconto<input id="service-discount" value="0,00" /></label>
              <label>Taxa servico<input id="service-fee" value="0,00" /></label>
            </div>
            <p class="service-lock-message" id="service-lock-message"></p>
          </section>

          <section class="service-catalog-panel">
            <div class="service-catalog-head">
              <p class="eyebrow">Selecione a categoria</p>
              <button class="ghost-btn" data-service-action="show-categories"><i data-lucide="grid-3x3"></i><span>Categorias</span></button>
            </div>
            <div class="service-category-grid" id="service-category-grid"></div>
            <div class="service-product-grid" id="service-product-grid"></div>
          </section>

          <aside class="service-actions-panel">
            <div class="service-action-grid service-action-grid-pro">
              <button data-service-action="open"><i data-lucide="play"></i><span>Abrir</span></button>
              <button data-service-action="reserve"><i data-lucide="calendar-check"></i><span>Reservar</span></button>
              <button data-service-action="bill"><i data-lucide="printer"></i><span>Pre fechamento</span></button>
              <button data-service-action="reopen"><i data-lucide="undo-2"></i><span>Reabrir</span></button>
              <button data-service-action="finish" class="service-finish"><i data-lucide="check-circle-2"></i><span>Fechar venda</span></button>
              <button data-service-action="cancel"><i data-lucide="ban"></i><span>Cancelar venda</span></button>
              <button data-service-action="save-close"><i data-lucide="save"></i><span>Salvar e fechar</span></button>
              <button data-service-action="partial-payment"><i data-lucide="hand-coins"></i><span>Pagamento parcial</span></button>
              <button data-service-action="discount-item"><i data-lucide="badge-percent"></i><span>Desconto item</span></button>
              <button data-service-action="change-qty"><i data-lucide="plus-minus"></i><span>Alterar qtd.</span></button>
            </div>
            <div class="service-transfer">
              <label>Transferir ou juntar com<input id="service-transfer-target" placeholder="Ex: 08 ou C012" /></label>
              <button class="ghost-btn" data-service-action="transfer"><i data-lucide="move-right"></i><span>Transferir</span></button>
              <button class="ghost-btn" data-service-action="merge"><i data-lucide="combine"></i><span>Juntar</span></button>
            </div>
            <div class="service-total-panel">
              <span>Total pendente</span><strong id="service-pending-total">R$ 0,00</strong>
              <span>Total geral</span><strong id="service-grand-total">R$ 0,00</strong>
            </div>
          </aside>
        </div>
      </section>
    </div>
  `);
}

function getServiceCollection(type) {
  return type === "table" ? serviceState.tables : serviceState.tabs;
}

function saveServiceState(type) {
  if (type === "table") localStorage.setItem("igs_tables", JSON.stringify(serviceState.tables));
  if (type === "tab") localStorage.setItem("igs_service_tabs", JSON.stringify(serviceState.tabs));
}

function openService(type, index) {
  ensureServiceModal();
  serviceState.current = { type, index };
  document.getElementById("service-overlay").classList.add("open");
  document.getElementById("service-overlay").setAttribute("aria-hidden", "false");
  renderServiceModal();
}

function renderServiceModal() {
  const current = serviceState.current;
  if (!current) return;
  const service = getServiceCollection(current.type)[current.index];
  if (!service) return;
  const total = (service.items || []).reduce((sum, item) => sum + item.qty * item.price, 0);
  service.total = total;
  const locked = service.status === "closing";
  document.getElementById("service-kind").textContent = current.type === "table" ? "Atendimento de mesa" : "Atendimento de comanda";
  document.getElementById("service-title").textContent = current.type === "table" ? `Mesa ${service.code}` : `Comanda ${service.code}`;
  const status = document.getElementById("service-status");
  status.className = `status ${service.status}`;
  status.textContent = statusLabel[service.status] || service.status;
  document.getElementById("service-total").textContent = money.format(total);
  document.getElementById("service-lock-message").textContent = locked ? "Conta solicitada: lançamentos bloqueados até o caixa reabrir ou finalizar." : "";
  document.getElementById("service-items").innerHTML = service.items?.length
    ? service.items.map((item, index) => `<div class="service-item"><span>${item.qty}x</span><strong>${item.name}</strong><em>${money.format(item.qty * item.price)}</em><button data-service-action="remove-item" data-service-item="${index}"><i data-lucide="trash-2"></i></button></div>`).join("")
    : `<div class="pdv-empty"><i data-lucide="receipt-text"></i><strong>Sem itens</strong><span>Abra e lance produtos.</span></div>`;
  saveServiceState(current.type);
  renderServiceSurfaces();
  lucide.createIcons();
}

function closeServiceModal() {
  document.getElementById("service-overlay")?.classList.remove("open");
  document.getElementById("service-overlay")?.setAttribute("aria-hidden", "true");
}

function renderServiceCatalog() {
  const categoryTarget = document.getElementById("service-category-grid");
  const productTarget = document.getElementById("service-product-grid");
  const select = document.getElementById("service-product");
  if (!categoryTarget || !productTarget || !select) return;
  const categories = productGroups.length ? productGroups : defaultProductGroups;
  categoryTarget.innerHTML = categories.map((group) => `
    <button class="${serviceState.category === group.name ? "active" : ""}" data-service-action="select-category" data-service-category="${group.name}">
      <i data-lucide="${group.icon || "layers-3"}"></i>
      <span>${group.name}</span>
    </button>
  `).join("");
  const products = serviceCatalog.filter((item) => item.category === serviceState.category);
  const visibleProducts = products.length ? products : serviceCatalog;
  productTarget.innerHTML = visibleProducts.map((product, index) => `
    <button data-service-action="quick-product" data-service-product="${serviceCatalog.indexOf(product)}">
      <i data-lucide="${product.icon}"></i>
      <strong>${product.name}</strong>
      <span>${money.format(product.price)} - ${product.sector}</span>
    </button>
  `).join("");
  select.innerHTML = serviceCatalog.map((product) => `<option value="${product.name}|${product.price}|${product.sector}">${product.name} - ${money.format(product.price)}</option>`).join("");
}

function renderServiceModal() {
  const current = serviceState.current;
  if (!current) return;
  const service = getServiceCollection(current.type)[current.index];
  if (!service) return;
  service.people = service.people || 1;
  service.discount = Number(service.discount || 0);
  service.service_fee = Number(service.service_fee || 0);
  service.total = getServiceTotal(service);
  const locked = service.status === "closing";
  document.getElementById("service-kind").textContent = current.type === "table" ? "Atendimento de mesa" : "Atendimento de comanda";
  document.getElementById("service-title").textContent = current.type === "table" ? `Mesa ${service.code}` : `Comanda ${service.code}`;
  const openedAt = document.getElementById("service-opened-at");
  if (openedAt) openedAt.textContent = new Date().toLocaleString("pt-BR");
  const status = document.getElementById("service-status");
  status.className = `status ${service.status}`;
  status.textContent = statusLabel[service.status] || service.status;
  document.getElementById("service-total").textContent = money.format(service.total);
  document.getElementById("service-lock-message").textContent = locked ? "Conta solicitada: lancamentos bloqueados ate o caixa reabrir ou finalizar." : "";
  document.getElementById("service-items").innerHTML = service.items?.length
    ? service.items.map((item, index) => `<div class="service-item"><strong>${item.name}<small>${item.note || item.sector || ""}</small></strong><span>${money.format(item.price)}</span><span>${item.qty}</span><em>${money.format(item.qty * item.price)}</em><button data-service-action="remove-item" data-service-item="${index}"><i data-lucide="trash-2"></i></button></div>`).join("")
    : `<div class="pdv-empty"><i data-lucide="receipt-text"></i><strong>Sem itens</strong><span>Abra e lance produtos.</span></div>`;
  const itemCount = (service.items || []).reduce((sum, item) => sum + Number(item.qty || 0), 0);
  const summaryItems = document.getElementById("service-summary-items");
  const people = document.getElementById("service-people");
  const discount = document.getElementById("service-discount");
  const fee = document.getElementById("service-fee");
  if (summaryItems) summaryItems.value = String(itemCount).replace(".", ",");
  if (people) people.value = service.people;
  if (discount) discount.value = money.format(service.discount).replace("R$", "").trim();
  if (fee) fee.value = money.format(service.service_fee).replace("R$", "").trim();
  document.getElementById("service-pending-total").textContent = money.format(service.total);
  document.getElementById("service-grand-total").textContent = money.format(service.total);
  renderServiceCatalog();
  saveServiceState(current.type);
  renderServiceSurfaces();
  lucide.createIcons();
}

function syncServiceAdjustments(service) {
  const people = document.getElementById("service-people");
  const discount = document.getElementById("service-discount");
  const fee = document.getElementById("service-fee");
  if (people) service.people = Math.max(1, Number(parseMoneyValue(people.value)) || 1);
  if (discount) service.discount = Math.max(0, parseMoneyValue(discount.value));
  if (fee) service.service_fee = Math.max(0, parseMoneyValue(fee.value));
}

function addServiceProduct(service, product, qty = 1, note = "") {
  if (service.status === "free" || service.status === "reserved") service.status = "open";
  service.items = service.items || [];
  service.items.push({ name: product.name, qty, price: Number(product.price), note, sector: product.sector });
  service.minutes = service.minutes || 1;
}

function handleServiceAction(action, event) {
  if (action === "close-modal") return closeServiceModal();
  const current = serviceState.current;
  if (!current) return;
  const collection = getServiceCollection(current.type);
  const service = collection[current.index];
  if (!service) return;
  syncServiceAdjustments(service);
  if (action === "select-category") {
    serviceState.category = event.target.closest("[data-service-category]")?.dataset.serviceCategory || serviceState.category;
    return renderServiceModal();
  }
  if (action === "show-categories") return renderServiceModal();
  if (action === "quick-product") {
    if (service.status === "closing") return renderServiceModal();
    const product = serviceCatalog[Number(event.target.closest("[data-service-product]")?.dataset.serviceProduct)];
    if (product) addServiceProduct(service, product, 1, "");
  }
  if (action === "open") service.status = "open";
  if (action === "reserve") service.status = "reserved";
  if (action === "bill") service.status = "closing";
  if (action === "reopen") service.status = service.items?.length ? "open" : "free";
  if (action === "save-close") {
    saveServiceState(current.type);
    renderServiceSurfaces();
    return closeServiceModal();
  }
  if (action === "partial-payment") {
    openServicePayment(current, service);
    return renderServiceModal();
  }
  if (action === "discount-item") {
    const lastItem = service.items?.[service.items.length - 1];
    if (lastItem) service.discount = Number(service.discount || 0) + Math.min(lastItem.price, 2);
  }
  if (action === "change-qty") {
    const lastItem = service.items?.[service.items.length - 1];
    const qty = Math.max(1, Number(parseMoneyValue(document.getElementById("service-qty")?.value || 1)) || 1);
    if (lastItem) lastItem.qty = qty;
  }
  if (action === "finish") {
    if ((service.items || []).length && getServiceTotal(service) > 0) {
      openServicePayment(current, service);
      return renderServiceModal();
    }
    releaseService(service);
  }
  if (action === "cancel") {
    service.status = "free"; service.items = []; service.total = 0; service.customer_name = null; service.minutes = 0;
  }
  if (action === "launch-item") {
    if (service.status === "closing") return renderServiceModal();
    const [name, price, sector] = document.getElementById("service-product").value.split("|");
    const qty = Math.max(1, Number(parseMoneyValue(document.getElementById("service-qty").value)) || 1);
    addServiceProduct(service, { name, price: Number(price), sector: sector || "" }, qty, document.getElementById("service-note").value);
  }
  if (action === "remove-item") {
    if (service.status === "closing") return renderServiceModal();
    const itemIndex = Number(event.target.closest("[data-service-item]")?.dataset.serviceItem);
    service.items?.splice(itemIndex, 1);
    if (!service.items?.length) service.status = "free";
  }
  if (action === "transfer" || action === "merge") {
    const targetCode = document.getElementById("service-transfer-target").value.trim().replace(/^Mesa\s+/i, "");
    const targetIndex = collection.findIndex((item) => item.code.toLowerCase() === targetCode.toLowerCase());
    if (targetIndex >= 0 && targetIndex !== current.index) {
      const target = collection[targetIndex];
      target.items = [...(target.items || []), ...(service.items || [])];
      target.status = target.items.length ? "open" : target.status;
      if (action === "transfer") { service.items = []; service.total = 0; service.status = "free"; }
      if (action === "merge") service.status = "closing";
    }
  }
  renderServiceModal();
}

function getServiceSubtotal(service) {
  return (service.items || []).reduce((sum, item) => sum + item.qty * item.price, 0);
}

function getServiceTotal(service) {
  return Math.max(0, getServiceSubtotal(service) - Number(service.discount || 0) + Number(service.service_fee || 0));
}

function releaseService(service) {
  service.status = "free";
  service.items = [];
  service.total = 0;
  service.customer_name = null;
  service.minutes = 0;
  service.discount = 0;
  service.service_fee = 0;
}

function openServicePayment(current, service) {
  pdvState.paymentContext = "service";
  pdvState.servicePayment = {
    type: current.type,
    index: current.index,
    title: current.type === "table" ? `Mesa ${service.code}` : `Comanda ${service.code}`,
  };
  pdvState.payments = [];
  pdvState.selectedPayment = "Dinheiro";
  openPaymentModal();
  setPdvMessage(`Finalizando ${pdvState.servicePayment.title}. Informe uma ou mais formas de pagamento.`);
}

function updateCustomerDeliveryFee() {
  const district = document.getElementById("customer-district");
  const feeTarget = document.getElementById("customer-delivery-fee");
  const orderTarget = document.getElementById("customer-order-value");
  const totalTarget = document.getElementById("customer-delivery-total");
  if (!district || !feeTarget || !orderTarget || !totalTarget) return;

  const fee = Number(district.value);
  const orderValue = parseMoneyValue(orderTarget.value);
  const total = orderValue + fee;
  const districtName = districtNames[district.value] || district.options[district.selectedIndex]?.textContent?.split("-")[0]?.trim() || "";

  feeTarget.value = money.format(fee);
  totalTarget.value = money.format(total);

  const deliveryDistrict = document.getElementById("delivery-district-preview");
  const deliveryFee = document.getElementById("delivery-fee-preview");
  const deliveryTotal = document.getElementById("delivery-total-preview");
  if (deliveryDistrict) deliveryDistrict.textContent = districtName;
  if (deliveryFee) deliveryFee.textContent = money.format(fee);
  if (deliveryTotal) deliveryTotal.textContent = money.format(total);
}

function normalizePhone(value) {
  return String(value || "").replace(/\D/g, "");
}

function getDeliveryCustomer(id) {
  return deliveryState.customers.find((customer) => customer.id === Number(id));
}

function getDeliveryOrder(id = deliveryState.selectedOrderId) {
  return deliveryState.orders.find((order) => order.id === Number(id));
}

function getDeliveryOrderTotal(order) {
  const subtotal = (order.items || []).reduce((sum, item) => sum + item.qty * item.price, 0);
  return subtotal + Number(order.fee || 0) + Number(order.serviceFee || 0) - Number(order.discount || 0);
}

function ensureDeliveryModal() {
  if (document.getElementById("delivery-flow-overlay")) return;
  document.body.insertAdjacentHTML("beforeend", `
    <div class="delivery-flow-overlay" id="delivery-flow-overlay" aria-hidden="true">
      <section class="delivery-flow-modal">
        <header>
          <div><p class="eyebrow" id="delivery-flow-kind">Delivery</p><h2 id="delivery-flow-title">Novo pedido</h2></div>
          <button class="icon-btn" data-delivery-action="close-flow" title="Fechar"><i data-lucide="x"></i></button>
        </header>
        <div id="delivery-flow-body"></div>
      </section>
    </div>
  `);
}

function openDeliveryFlow(kind) {
  ensureDeliveryModal();
  document.getElementById("delivery-flow-overlay").classList.add("open");
  document.getElementById("delivery-flow-overlay").setAttribute("aria-hidden", "false");
  renderDeliveryFlow(kind);
}

function closeDeliveryFlow() {
  document.getElementById("delivery-flow-overlay")?.classList.remove("open");
  document.getElementById("delivery-flow-overlay")?.setAttribute("aria-hidden", "true");
}

function openDeliveryReturn(order = getDeliveryOrder()) {
  if (!order) return;
  ensureDeliveryModal();
  document.getElementById("delivery-flow-overlay").classList.add("open");
  document.getElementById("delivery-flow-overlay").setAttribute("aria-hidden", "false");
  document.getElementById("delivery-flow-kind").textContent = "Retorno do motoqueiro";
  document.getElementById("delivery-flow-title").textContent = `Conferir recebimento ${order.id}`;
  const total = getDeliveryOrderTotal(order);
  document.getElementById("delivery-flow-body").innerHTML = `
    <div class="delivery-return-layout">
      <section class="delivery-return-summary">
        <div><span>Cliente</span><strong>${order.customer}</strong></div>
        <div><span>Entregador</span><strong>${order.courier || "Sem motoqueiro"}</strong></div>
        <div><span>Total da venda</span><strong>${money.format(total)}</strong></div>
        <div><span>Forma combinada</span><strong>${order.payment || "Nao informada"}</strong></div>
      </section>
      <section class="delivery-return-payment">
        <label>Forma paga na entrega
          <select id="delivery-return-payment">
            <option ${order.payment === "Dinheiro" ? "selected" : ""}>Dinheiro</option>
            <option ${order.payment === "Debito" ? "selected" : ""}>Debito</option>
            <option ${order.payment === "Credito" ? "selected" : ""}>Credito</option>
            <option ${order.payment === "PIX" ? "selected" : ""}>PIX</option>
            <option ${order.payment === "Vale refeicao" ? "selected" : ""}>Vale refeicao</option>
            <option ${order.payment === "Fiado" ? "selected" : ""}>Fiado</option>
          </select>
        </label>
        <label>Valor recebido<input id="delivery-return-paid" value="${money.format(total).replace("R$", "").trim()}" /></label>
        <label>Observacao<input id="delivery-return-note" placeholder="Ex: cliente mudou para cartao" /></label>
        <div class="delivery-return-change"><span>Troco</span><strong id="delivery-return-change">${money.format(0)}</strong></div>
        <button class="primary-btn" data-delivery-action="confirm-return"><i data-lucide="check-circle-2"></i><span>Confirmar retorno e finalizar</span></button>
        <button class="ghost-btn" data-delivery-action="close-flow"><i data-lucide="x"></i><span>Cancelar</span></button>
      </section>
    </div>
  `;
  document.getElementById("delivery-return-paid")?.addEventListener("input", updateDeliveryReturnChange);
  updateDeliveryReturnChange();
  lucide.createIcons();
}

function updateDeliveryReturnChange() {
  const order = getDeliveryOrder();
  const target = document.getElementById("delivery-return-change");
  const paid = parseMoneyValue(document.getElementById("delivery-return-paid")?.value || 0);
  if (target && order) target.textContent = money.format(Math.max(0, paid - getDeliveryOrderTotal(order)));
}

function renderDeliveryFlow(kind) {
  const body = document.getElementById("delivery-flow-body");
  if (!body) return;
  const customer = getDeliveryCustomer(deliveryState.selectedCustomerId);
  document.getElementById("delivery-flow-kind").textContent = kind === "customer" ? "Cadastro de cliente" : "Delivery venda";
  document.getElementById("delivery-flow-title").textContent = kind === "customer" ? "Cliente nao localizado" : `Pedido ${deliveryState.draft?.id || ""}`;

  if (kind === "customer") {
    const phone = normalizePhone(document.getElementById("delivery-phone-search")?.value);
    body.innerHTML = `
      <div class="delivery-customer-form">
        <label>Nome / Razao Social<input id="delivery-new-name" /></label>
        <label>Telefone<input id="delivery-new-phone" value="${phone}" /></label>
        <label>CEP<input id="delivery-new-cep" /></label>
        <label>Endereco<input id="delivery-new-address" /></label>
        <label>Numero<input id="delivery-new-number" /></label>
        <label>Bairro<select id="delivery-new-district"><option value="Bethania|5">Bethania - R$ 5,00</option><option value="Centro|10">Centro - R$ 10,00</option><option value="Caravelas|7">Caravelas - R$ 7,00</option><option value="Giovanni|11">Giovanni - R$ 11,00</option></select></label>
        <label>Cidade<input id="delivery-new-city" value="Coronel Fabriciano" /></label>
        <label>UF<input id="delivery-new-state" value="MG" /></label>
        <label class="span-2">Ponto de referencia<input id="delivery-new-reference" /></label>
        <button class="primary-btn span-2" data-delivery-action="save-customer"><i data-lucide="check"></i><span>Confirmar cadastro e abrir pedido</span></button>
      </div>
    `;
  } else {
    const order = deliveryState.draft;
    const subtotal = (order.items || []).reduce((sum, item) => sum + item.qty * item.price, 0);
    body.innerHTML = `
      <div class="delivery-order-layout">
        <section class="delivery-order-left">
          <div class="delivery-client-strip">
            <strong>${customer?.name || order.customer}</strong>
            <span>${customer?.address || order.address}, ${customer?.number || ""} | Bairro: ${customer?.district || order.district}</span>
            <span>Taxa entrega: ${money.format(order.fee || 0)} | Total de ${order.items.length} itens</span>
          </div>
          <label>Observacao<textarea id="delivery-order-note">${order.note || ""}</textarea></label>
          <div class="delivery-order-items" id="delivery-order-items">
            ${(order.items || []).map((item, index) => `<div><span>${index + 1}</span><strong>${item.name}</strong><em>${item.qty} x ${money.format(item.price)}</em><button data-delivery-action="remove-draft-item" data-draft-item="${index}"><i data-lucide="trash-2"></i></button></div>`).join("") || `<div class="pdv-empty"><i data-lucide="shopping-bag"></i><strong>Sem itens</strong><span>Escolha produtos para iniciar.</span></div>`}
          </div>
          <div class="delivery-order-summary">
            <span>Subtotal <strong>${money.format(subtotal)}</strong></span>
            <span>Tx entrega <strong>${money.format(order.fee || 0)}</strong></span>
            <span>Total <strong>${money.format(getDeliveryOrderTotal(order))}</strong></span>
          </div>
        </section>
        <section class="delivery-order-catalog">
          <div class="service-category-grid">${(productGroups.length ? productGroups : defaultProductGroups).map((group) => `<button data-delivery-action="draft-category" data-delivery-category="${group.name}"><i data-lucide="${group.icon || "layers-3"}"></i><span>${group.name}</span></button>`).join("")}</div>
          <div class="service-product-grid">${serviceCatalog.filter((item) => item.category === (deliveryState.category || "AGUA")).map((product) => `<button data-delivery-action="draft-product" data-delivery-product="${serviceCatalog.indexOf(product)}"><i data-lucide="${product.icon}"></i><strong>${product.name}</strong><span>${money.format(product.price)} - ${product.sector}</span></button>`).join("")}</div>
        </section>
        <aside class="delivery-order-payment">
          <label>Forma pagamento<select id="delivery-draft-payment"><option>Dinheiro</option><option>Debito</option><option>Credito</option><option>PIX</option><option>Vale refeicao</option><option>Fiado</option></select></label>
          <label>Entregador<select id="delivery-draft-courier"><option>Sem entregador</option><option>Rafa</option><option>Nina</option><option>Bruno</option><option>Diego</option></select></label>
          <label><input type="checkbox" id="delivery-draft-scheduled" /> Agendamento</label>
          <button class="primary-btn" data-delivery-action="confirm-draft"><i data-lucide="check"></i><span>Confirmar pedido</span></button>
          <button class="ghost-btn" data-delivery-action="close-flow"><i data-lucide="x"></i><span>Cancelar</span></button>
        </aside>
      </div>
    `;
  }
  lucide.createIcons();
}

function startDeliveryOrder(customer) {
  deliveryState.selectedCustomerId = customer.id;
  deliveryState.category = "AGUA";
  deliveryState.draft = {
    id: Math.max(62018, ...deliveryState.orders.map((order) => order.id)) + 1,
    customerId: customer.id,
    customer: customer.name,
    phone: customer.phone,
    address: `${customer.address}, ${customer.number}`,
    district: customer.district,
    fee: Number(customer.fee || 0),
    status: "pending",
    courier: "",
    payment: "Dinheiro",
    items: [],
    createdAt: new Date().toLocaleString("pt-BR"),
    scheduled: false,
  };
  openDeliveryFlow("order");
}

function handleDeliveryAction(action, event) {
  if (action === "close-flow") return closeDeliveryFlow();
  if (action === "new-order" || action === "lookup") {
    const phone = normalizePhone(document.getElementById("delivery-phone-search")?.value);
    const name = (document.getElementById("delivery-name-search")?.value || "").trim().toLowerCase();
    const customer = deliveryState.customers.find((item) => (phone && normalizePhone(item.phone).includes(phone)) || (name && item.name.toLowerCase().includes(name)));
    if (customer) {
      deliveryState.selectedCustomerId = customer.id;
      renderDeliveryCustomerPreview(customer);
      startDeliveryOrder(customer);
    } else {
      openDeliveryFlow("customer");
    }
    return;
  }
  if (action === "save-customer") {
    const [district, fee] = document.getElementById("delivery-new-district").value.split("|");
    const customer = {
      id: Math.max(45, ...deliveryState.customers.map((item) => item.id)) + 1,
      name: (document.getElementById("delivery-new-name").value || "CLIENTE DELIVERY").toUpperCase(),
      phone: normalizePhone(document.getElementById("delivery-new-phone").value),
      address: document.getElementById("delivery-new-address").value || "Endereco nao informado",
      number: document.getElementById("delivery-new-number").value || "S/N",
      district,
      city: document.getElementById("delivery-new-city").value,
      state: document.getElementById("delivery-new-state").value,
      reference: document.getElementById("delivery-new-reference").value,
      fee: Number(fee),
      credit: 0,
      points: 0,
    };
    deliveryState.customers.push(customer);
    renderDeliveryCustomerPreview(customer);
    startDeliveryOrder(customer);
    return;
  }
  if (action === "draft-category") {
    deliveryState.category = event.target.closest("[data-delivery-category]").dataset.deliveryCategory;
    return renderDeliveryFlow("order");
  }
  if (action === "draft-product") {
    const product = serviceCatalog[Number(event.target.closest("[data-delivery-product]").dataset.deliveryProduct)];
    if (product && deliveryState.draft) deliveryState.draft.items.push({ name: product.name, qty: 1, price: product.price, sector: product.sector });
    return renderDeliveryFlow("order");
  }
  if (action === "remove-draft-item") {
    deliveryState.draft?.items.splice(Number(event.target.closest("[data-draft-item]").dataset.draftItem), 1);
    return renderDeliveryFlow("order");
  }
  if (action === "confirm-draft") {
    if (!deliveryState.draft?.items.length) return;
    deliveryState.draft.payment = document.getElementById("delivery-draft-payment").value;
    deliveryState.draft.courier = document.getElementById("delivery-draft-courier").value === "Sem entregador" ? "" : document.getElementById("delivery-draft-courier").value;
    deliveryState.draft.scheduled = document.getElementById("delivery-draft-scheduled").checked;
    deliveryState.draft.status = deliveryState.draft.scheduled ? "scheduled" : "pending";
    deliveryState.orders.push(deliveryState.draft);
    deliveryState.selectedOrderId = deliveryState.draft.id;
    deliveryState.activeTab = deliveryState.draft.status;
    deliveryState.draft = null;
    closeDeliveryFlow();
    renderDeliveryBoard();
    return;
  }
  const order = getDeliveryOrder();
  if (!order) return;
  if (action === "select-order") deliveryState.selectedOrderId = Number(event.target.closest("[data-delivery-order]").dataset.deliveryOrder);
  if (action === "dispatch-selected") { order.status = "out_for_delivery"; if (!order.courier) order.courier = "Rafa"; deliveryState.activeTab = "out_for_delivery"; }
  if (action === "finish-selected") {
    if (order.status === "out_for_delivery") return openDeliveryReturn(order);
    order.status = "delivered";
    order.closedAt = new Date().toLocaleString("pt-BR");
    deliveryState.activeTab = "delivered";
  }
  if (action === "confirm-return") {
    const paid = parseMoneyValue(document.getElementById("delivery-return-paid")?.value || 0);
    const payment = document.getElementById("delivery-return-payment")?.value || order.payment || "Dinheiro";
    order.payment = payment;
    order.paidAmount = paid;
    order.change = Math.max(0, paid - getDeliveryOrderTotal(order));
    order.returnNote = document.getElementById("delivery-return-note")?.value || "";
    order.status = "delivered";
    order.closedAt = new Date().toLocaleString("pt-BR");
    deliveryState.cashEntries.push({
      orderId: order.id,
      customer: order.customer,
      method: payment,
      amount: getDeliveryOrderTotal(order),
      paid,
      change: order.change,
      createdAt: order.closedAt,
    });
    deliveryState.activeTab = "delivered";
    closeDeliveryFlow();
  }
  if (action === "cancel-selected") order.status = "cancelled";
  if (action === "view-selected" || action === "edit-selected") {
    deliveryState.draft = { ...order, items: [...order.items] };
    openDeliveryFlow("order");
    return;
  }
  renderDeliveryBoard();
}

function renderDeliveryCustomerPreview(customer = getDeliveryCustomer(deliveryState.selectedCustomerId)) {
  const target = document.getElementById("delivery-customer-preview");
  if (!target) return;
  if (!customer) {
    target.innerHTML = `<div class="pdv-empty"><i data-lucide="user-search"></i><strong>Nenhum cliente selecionado</strong><span>Digite telefone e consulte para iniciar o pedido.</span></div>`;
    lucide.createIcons();
    return;
  }
  target.innerHTML = `
    <div><span>Cliente</span><strong>${customer.name}</strong></div>
    <div><span>Endereco</span><strong>${customer.address}, ${customer.number}</strong></div>
    <div><span>Bairro</span><strong>${customer.district}</strong></div>
    <div><span>Taxa entrega</span><strong>${money.format(customer.fee || 0)}</strong></div>
  `;
}

function setPdvMessage(message) {
  const target = document.getElementById("pdv-message");
  if (target) target.textContent = message;
}

function addPdvItem(name, price) {
  const found = pdvState.items.find((item) => item.name === name);
  if (found) {
    found.qty += 1;
    pdvState.selectedIndex = pdvState.items.indexOf(found);
  } else {
    pdvState.items.push({ name, qty: 1, price });
    pdvState.selectedIndex = pdvState.items.length - 1;
  }
  setPdvMessage(`${name} adicionado ao cupom.`);
  renderPdv();
}

function handlePdvAction(action) {
  if (action === "cancel-item") {
    if (!pdvState.items.length) {
      setPdvMessage("Não há item para cancelar.");
      return;
    }
    const removed = pdvState.items.splice(pdvState.selectedIndex, 1)[0];
    pdvState.selectedIndex = Math.max(0, pdvState.selectedIndex - 1);
    setPdvMessage(`Item cancelado: ${removed.name}.`);
  }

  if (action === "cancel-sale") {
    pdvState.items = [];
    pdvState.discount = 0;
    pdvState.surcharge = 0;
    pdvState.payments = [];
    pdvState.selectedIndex = 0;
    setPdvMessage("Cupom cancelado. Pronto para nova venda.");
  }

  if (action === "discount") {
    pdvState.discount = pdvState.discount ? 0 : 5;
    setPdvMessage(pdvState.discount ? "Desconto de R$ 5,00 aplicado." : "Desconto removido.");
  }

  if (action === "surcharge") {
    pdvState.surcharge = pdvState.surcharge ? 0 : 3;
    setPdvMessage(pdvState.surcharge ? "Acréscimo de R$ 3,00 aplicado." : "Acréscimo removido.");
  }

  if (action === "finalize") {
    if (!pdvState.items.length) {
      setPdvMessage("Adicione produtos antes de finalizar.");
      renderPdv();
      return;
    }
    pdvState.paymentContext = "pdv";
    pdvState.servicePayment = null;
    pdvState.payments = [];
    openPaymentModal();
    setPdvMessage("Informe uma ou mais formas de pagamento.");
  }

  if (action === "customer") {
    setPdvMessage("Cliente vinculado: Consumidor final. Cadastro completo entra na próxima etapa.");
  }

  if (action === "close-payment") {
    closePaymentModal();
    pdvState.paymentContext = "pdv";
    pdvState.servicePayment = null;
    setPdvMessage("Finalização fechada.");
  }

  if (action === "add-payment") {
    addPaymentLine();
  }

  if (action === "confirm-payment") {
    const { remaining } = getPaymentTotals();
    if (remaining > 0.009) {
      setPdvMessage("Ainda existe valor restante para concluir a venda.");
    } else {
      showReceipt();
      if (pdvState.paymentContext === "service") {
        finishServicePayment();
      } else {
        resetPdvSale();
      }
      closePaymentModal();
      setPdvMessage("Venda finalizada. Cupom pronto para emissão.");
    }
  }

  renderPdv();
}

function getPdvTotal() {
  if (pdvState.paymentContext === "service") {
    const service = getCurrentPaymentService();
    return service ? getServiceTotal(service) : 0;
  }
  const subtotal = pdvState.items.reduce((sum, item) => sum + item.qty * item.price, 0);
  return Math.max(0, subtotal - pdvState.discount + pdvState.surcharge);
}

function resetPdvSale() {
  pdvState.items = [];
  pdvState.discount = 0;
  pdvState.surcharge = 0;
  pdvState.payments = [];
  pdvState.paymentContext = "pdv";
  pdvState.servicePayment = null;
  pdvState.selectedIndex = 0;
  pdvState.lastReceiptNumber += 1;
}

function getCurrentPaymentService() {
  const servicePayment = pdvState.servicePayment;
  if (!servicePayment) return null;
  return getServiceCollection(servicePayment.type)[servicePayment.index] || null;
}

function finishServicePayment() {
  const service = getCurrentPaymentService();
  if (service) {
    releaseService(service);
    saveServiceState(pdvState.servicePayment.type);
    renderServiceSurfaces();
    renderServiceModal();
  }
  pdvState.payments = [];
  pdvState.paymentContext = "pdv";
  pdvState.servicePayment = null;
  pdvState.lastReceiptNumber += 1;
  closeServiceModal();
}

function showReceipt() {
  const overlay = document.getElementById("receipt-overlay");
  const paper = document.getElementById("receipt-paper");
  if (!overlay || !paper) return;
  document.body.appendChild(overlay);

  const service = pdvState.paymentContext === "service" ? getCurrentPaymentService() : null;
  const saleItems = service ? service.items || [] : pdvState.items;
  const saleTitle = service ? pdvState.servicePayment.title : "Venda balcão";
  const subtotal = saleItems.reduce((sum, item) => sum + item.qty * item.price, 0);
  const total = getPdvTotal();
  const paid = pdvState.payments.reduce((sum, payment) => sum + payment.amount, 0);
  const change = Math.max(0, paid - total);
  const lines = saleItems
    .map((item) => `<div><span>${item.qty}x ${item.name}</span><strong>${money.format(item.qty * item.price)}</strong></div>`)
    .join("");
  const paymentLines = pdvState.payments
    .map((payment) => `<div><span>${payment.method}</span><strong>${money.format(payment.amount)}</strong></div>`)
    .join("");

  paper.innerHTML = `
    <h3>IGS BURGER HOUSE</h3>
    <p>CNPJ 12.345.678/0001-90<br />Av. Brasil, 1000 - Centro<br />CUPOM NAO FISCAL</p>
    <hr />
    <p>Cupom: ${String(pdvState.lastReceiptNumber).padStart(6, "0")}<br />${saleTitle}<br />${new Date().toLocaleString("pt-BR")}</p>
    <hr />
    ${lines}
    <hr />
    <div><span>Subtotal</span><strong>${money.format(subtotal)}</strong></div>
    <div><span>Desconto</span><strong>${money.format(pdvState.discount)}</strong></div>
    <div><span>Acrescimo</span><strong>${money.format(pdvState.surcharge)}</strong></div>
    <div class="receipt-total"><span>Total</span><strong>${money.format(total)}</strong></div>
    <hr />
    ${paymentLines}
    <div><span>Troco</span><strong>${money.format(change)}</strong></div>
    <hr />
    <p>Obrigado pela preferencia.<br />Volte sempre!</p>
  `;
  overlay.classList.add("open");
  overlay.setAttribute("aria-hidden", "false");
}

function closeReceipt() {
  const overlay = document.getElementById("receipt-overlay");
  if (!overlay) return;
  overlay.classList.remove("open");
  overlay.setAttribute("aria-hidden", "true");
}

function parseMoneyValue(value) {
  const normalized = String(value).replace(/\./g, "").replace(",", ".").replace(/[^\d.-]/g, "");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getPaymentTotals() {
  const total = getPdvTotal();
  const paid = pdvState.payments.reduce((sum, payment) => sum + payment.amount, 0);
  return {
    total,
    paid,
    remaining: Math.max(0, total - paid),
    change: Math.max(0, paid - total),
  };
}

function fillRemainingPayment() {
  const input = document.getElementById("payment-amount");
  if (!input) return;
  const { remaining } = getPaymentTotals();
  input.value = money.format(remaining || getPdvTotal()).replace("R$", "").trim();
}

function openPaymentModal() {
  const overlay = document.getElementById("pdv-payment-overlay");
  if (!overlay) return;
  document.body.appendChild(overlay);
  overlay.classList.add("open");
  overlay.setAttribute("aria-hidden", "false");
  document.querySelectorAll("[data-payment-method]").forEach((item) => {
    item.classList.toggle("active", item.dataset.paymentMethod === pdvState.selectedPayment);
  });
  fillRemainingPayment();
  renderPayment();
}

function closePaymentModal() {
  const overlay = document.getElementById("pdv-payment-overlay");
  if (!overlay) return;
  overlay.classList.remove("open");
  overlay.setAttribute("aria-hidden", "true");
}

function addPaymentLine() {
  const input = document.getElementById("payment-amount");
  const amount = parseMoneyValue(input?.value || 0);
  if (amount <= 0) {
    setPdvMessage("Informe um valor de pagamento maior que zero.");
    return;
  }
  pdvState.payments.push({ method: pdvState.selectedPayment, amount });
  setPdvMessage(`${pdvState.selectedPayment} adicionado: ${money.format(amount)}.`);
  fillRemainingPayment();
  renderPayment();
}

function renderPayment() {
  const modal = document.getElementById("pdv-payment-overlay");
  if (!modal) return;
  const { total, paid, remaining, change } = getPaymentTotals();
  document.getElementById("payment-sale-total").textContent = money.format(total);
  document.getElementById("payment-paid").textContent = money.format(paid);
  document.getElementById("payment-remaining").textContent = money.format(remaining);
  document.getElementById("payment-change").textContent = money.format(change);

  const lines = document.getElementById("payment-lines");
  lines.innerHTML = pdvState.payments.length
    ? pdvState.payments
        .map((payment) => `<div class="payment-line"><strong>${payment.method}</strong><span>${money.format(payment.amount)}</span></div>`)
        .join("")
    : `<div class="pdv-empty"><i data-lucide="wallet-cards"></i><strong>Nenhum pagamento</strong><span>Escolha uma forma e adicione o valor.</span></div>`;
  lucide.createIcons();
}

function renderPdv() {
  const itemsTarget = document.getElementById("pdv-items");
  if (!itemsTarget) return;

  itemsTarget.innerHTML = pdvState.items.length
    ? pdvState.items
        .map(
          (item, index) => `
            <div class="pdv-item ${index === pdvState.selectedIndex ? "selected" : ""}" data-pdv-index="${index}">
              <span>${item.qty}x</span>
              <strong>${item.name}</strong>
              <em>${money.format(item.qty * item.price)}</em>
            </div>
          `,
        )
        .join("")
    : `<div class="pdv-empty"><i data-lucide="shopping-cart"></i><strong>Cupom vazio</strong><span>Adicione produtos para iniciar a venda.</span></div>`;

  document.querySelectorAll("[data-pdv-index]").forEach((item) => {
    item.addEventListener("click", () => {
      pdvState.selectedIndex = Number(item.dataset.pdvIndex);
      renderPdv();
    });
  });

  const subtotal = pdvState.items.reduce((sum, item) => sum + item.qty * item.price, 0);
  const total = getPdvTotal();
  document.getElementById("pdv-subtotal").textContent = money.format(subtotal);
  document.getElementById("pdv-discount").textContent = money.format(pdvState.discount);
  document.getElementById("pdv-surcharge").textContent = money.format(pdvState.surcharge);
  document.getElementById("pdv-total").textContent = money.format(total);
  renderPayment();
  lucide.createIcons();
}

function renderMetrics(summary) {
  const items = [
    ["Vendas hoje", money.format(summary.revenue), "flame"],
    ["Pedidos", summary.orders, "receipt-text"],
    ["Ticket médio", money.format(summary.average_ticket), "badge-dollar-sign"],
    ["Mesas abertas", summary.open_tables, "utensils"],
    ["Delivery pendente", summary.delivery_pending, "bike"],
    ["Alertas estoque", summary.stock_alerts, "triangle-alert"],
  ];
  document.getElementById("metrics").innerHTML = items
    .map(
      ([label, value, icon]) => `
        <article class="metric-card">
          <i data-lucide="${icon}"></i>
          <span>${label}</span>
          <strong>${value}</strong>
        </article>
      `,
    )
    .join("");
}

function renderChart(chart) {
  const max = Math.max(...chart.map((item) => item.value));
  document.getElementById("sales-chart").innerHTML = chart
    .map((item) => {
      const height = Math.max(18, (item.value / max) * 220);
      return `<div class="bar" style="height:${height}px" title="${money.format(item.value)}"><span>${item.label}</span></div>`;
    })
    .join("");
}

function renderTables(tables) {
  serviceState.tables = tables.map((table) => ({ items: [], ...table }));
  document.getElementById("table-map").innerHTML = tables
    .map(
      (table, index) => `
        <article class="table-card table-card-action ${table.status === "closing" ? "locked" : ""}" data-open-service data-service-type="table" data-service-index="${index}">
          <div class="table-card-visual"><i data-lucide="utensils"></i><span>${table.code}</span></div>
          <div>
            <span class="status ${table.status}">${statusLabel[table.status]}</span>
            <h2>Mesa ${table.code}</h2>
            <p class="muted">${table.seats} lugares ${table.waiter ? `- ${table.waiter}` : ""}</p>
          </div>
          <div>
            <strong>${money.format(table.total)}</strong>
            <p class="muted">${table.minutes ? `${table.minutes} min de permanência` : "Pronta para abrir"}</p>
          </div>
        </article>
      `,
    )
    .join("");
}

function renderProducts(products) {
  document.getElementById("product-grid").innerHTML = products
    .map(
      (product) => `
        <article class="product-card">
          <span class="status ${product.stock === "low" ? "closing" : "free"}">${product.stock === "low" ? "Estoque baixo" : "Disponível"}</span>
          <h2>${product.name}</h2>
          <p class="muted">${product.category} - ${product.sector}</p>
          <strong>${money.format(product.price)}</strong>
        </article>
      `,
    )
    .join("");
}

function renderProducts(products) {
  renderServiceTabs();
}

function renderServiceTabs() {
  const target = document.getElementById("product-grid") || document.getElementById("service-tabs-map");
  if (!target) return;
  if (!serviceState.tabs.length) serviceState.tabs = loadServiceTabs();
  target.classList.add("service-command-grid");
  target.innerHTML = serviceState.tabs.map((tab, index) => `
    <article class="table-card table-card-action ${tab.status === "closing" ? "locked" : ""}" data-open-service data-service-type="tab" data-service-index="${index}">
      <div class="table-card-visual command"><i data-lucide="receipt-text"></i><span>${tab.code}</span></div>
      <div>
        <span class="status ${tab.status}">${statusLabel[tab.status] || tab.status}</span>
        <h2>Comanda ${tab.code}</h2>
        <p class="muted">${tab.tab_type || "Física"} ${tab.customer_name ? `- ${tab.customer_name}` : ""}</p>
      </div>
      <div>
        <strong>${money.format(tab.total || 0)}</strong>
        <p class="muted">${tab.status === "closing" ? "Aguardando caixa" : tab.items?.length ? `${tab.items.length} itens` : "Livre para abrir"}</p>
      </div>
    </article>
  `).join("");
}

function renderServiceSurfaces() {
  renderTables(serviceState.tables);
  renderServiceTabs();
}

function renderKanban(items) {
  const columns = [
    ["sent", "Recebidos"],
    ["preparing", "Em preparo"],
    ["ready", "Prontos"],
  ];
  document.getElementById("kanban").innerHTML = columns
    .map(([status, title]) => {
      const cards = items
        .filter((item) => item.status === status)
        .map(
          (item) => `
            <article class="ticket-card">
              <span class="status ${status === "ready" ? "free" : status === "preparing" ? "closing" : "reserved"}">${item.sector}</span>
              <h2>${item.ticket}</h2>
              <ul>${item.items.map((line) => `<li>${line}</li>`).join("")}</ul>
              <p class="muted">${item.waiter} - ${item.elapsed}</p>
            </article>
          `,
        )
        .join("");
      return `<section class="kanban-column"><h3>${title}</h3>${cards}</section>`;
    })
    .join("");
}

function renderDeliveries(deliveries) {
  if (!deliveryState.orders.length && Array.isArray(deliveries)) {
    deliveryState.orders = deliveries.map((item, index) => ({
      id: 62018 + index,
      customer: item.customer,
      phone: "",
      address: "Endereco cadastrado",
      district: item.district,
      fee: item.district === "Centro" ? 10 : 5,
      status: item.status,
      courier: item.courier === "Livre" ? "" : item.courier,
      payment: "PIX",
      items: [{ name: "Pedido delivery", qty: 1, price: item.total, sector: "Cozinha" }],
      createdAt: new Date().toLocaleString("pt-BR"),
      scheduled: false,
    }));
  }
  renderDeliveryCustomerPreview();
  renderDeliveryBoard();
}

function renderDeliveryBoard() {
  const board = document.getElementById("delivery-board");
  if (!board) return;
  const active = deliveryState.activeTab;
  document.querySelectorAll("[data-delivery-tab]").forEach((button) => button.classList.toggle("active", button.dataset.deliveryTab === active));
  const counts = {
    pending: deliveryState.orders.filter((order) => order.status === "pending").length,
    out_for_delivery: deliveryState.orders.filter((order) => order.status === "out_for_delivery").length,
    scheduled: deliveryState.orders.filter((order) => order.status === "scheduled").length,
    delivered: deliveryState.orders.filter((order) => order.status === "delivered").length,
  };
  document.getElementById("delivery-count-pending").textContent = counts.pending;
  document.getElementById("delivery-count-out").textContent = counts.out_for_delivery;
  document.getElementById("delivery-count-scheduled").textContent = counts.scheduled;
  document.getElementById("delivery-count-delivered").textContent = counts.delivered;
  document.getElementById("delivery-board-title").textContent = {
    pending: "Pedidos em processo",
    out_for_delivery: "Pedidos em transito",
    scheduled: "Pedidos agendados",
    delivered: "Pedidos finalizados",
  }[active] || "Pedidos";
  const filter = (document.getElementById("delivery-board-filter")?.value || "").toLowerCase();
  const orders = deliveryState.orders.filter((order) => order.status === active && (!filter || order.customer.toLowerCase().includes(filter)));
  board.innerHTML = orders.length
    ? orders.map((order) => `
      <article class="delivery-order-card ${order.id === deliveryState.selectedOrderId ? "selected" : ""}" data-delivery-order="${order.id}" data-delivery-action="select-order">
        <div class="delivery-order-icon"><i data-lucide="${order.status === "out_for_delivery" ? "bike" : order.status === "delivered" ? "check-circle-2" : "receipt-text"}"></i></div>
        <strong>${order.customer}</strong>
        <span>Senha: ${order.id - 62017}</span>
        <em>${order.courier || "Sem motoqueiro"}</em>
        <small>${money.format(getDeliveryOrderTotal(order))}</small>
        <small>${order.status === "delivered" ? `Pago: ${order.payment || ""}` : order.payment || ""}</small>
      </article>
    `).join("")
    : `<div class="pdv-empty"><i data-lucide="bike"></i><strong>Nenhum pedido nesta etapa</strong><span>Os pedidos aparecem aqui conforme o andamento.</span></div>`;
  lucide.createIcons();
}

function renderFinance(entries) {
  document.getElementById("finance-list").innerHTML = entries
    .map(
      (item) => `
        <article class="list-item">
          <strong>${item.description}</strong>
          <span>${item.type === "receivable" ? "Conta a receber" : "Conta a pagar"}</span>
          <span>${money.format(item.amount)}</span>
          <span class="status ${item.status === "paid" ? "free" : item.status === "overdue" ? "occupied" : "reserved"}">${statusLabel[item.status]}</span>
        </article>
      `,
    )
    .join("");
}

function renderProductGroups() {
  const grid = document.getElementById("group-grid");
  const table = document.getElementById("group-table");
  if (!grid || !table) return;

  grid.innerHTML = productGroups
    .map(
      (group) => `
        <article class="group-card ${group.status === "Inativo" ? "inactive" : ""}" data-group-code="${group.code}">
          <div class="group-icon"><i data-lucide="${group.icon || "layers-3"}"></i></div>
          <div>
            <span>${group.code} - ${group.type}</span>
            <strong>${group.name}</strong>
            <p>${group.products || 0} produtos - ${group.sector}</p>
          </div>
          <div class="group-card-actions">
            <button data-group-action="edit" title="Editar"><i data-lucide="pencil"></i></button>
            <button data-group-action="delete" title="Excluir"><i data-lucide="trash-2"></i></button>
          </div>
        </article>
      `,
    )
    .join("");

  table.innerHTML = productGroups
    .map(
      (group) => `
        <div class="data-row">
          <span>${group.code} - ${group.name}</span>
          <span>${group.type}</span>
          <span>${group.sector}</span>
          <span>${group.status}</span>
        </div>
      `,
    )
    .join("");
  lucide.createIcons();
}

async function boot() {
  const health = await fetch("/api/health").then((response) => response.json());
  const data = await fetch("/api/dashboard").then((response) => response.json());
  document.getElementById("db-mode").textContent = health.database === "postgres" ? "PostgreSQL conectado" : "modo demonstração";
  document.getElementById("company-name").textContent = data.company?.name || "modo demonstração";
  renderMetrics(data.summary);
  renderChart(data.chart);
  renderTables(getStoredTables(data.tables));
  renderProducts(data.products);
  renderKanban(data.kitchen);
  renderDeliveries(data.deliveries);
  renderFinance(data.finance);
  renderPdv();
  productGroups = loadProductGroups();
  renderProductGroups();
  restoreGeneratedTabs();
  updateCustomerDeliveryFee();
  lucide.createIcons();
}

bindNavigation();
boot();
