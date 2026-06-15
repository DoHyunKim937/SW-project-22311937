
function attachParticle(word, withFinal, withoutFinal) {
  const lastChar = word.charCodeAt(word.length - 1);
  
  const hasFinal = lastChar >= 0xac00 && lastChar <= 0xd7a3
    ? (lastChar - 0xac00) % 28 !== 0
    : false;
  return word + (hasFinal ? withFinal : withoutFinal);
}


function fmt(value) {
  if (value === null || value === undefined) return "-";
  return Number(value).toLocaleString("ko-KR", { maximumFractionDigits: 2 });
}

class User {
  constructor(userId, password, email) {
    this.userId = userId;
    this.password = password;
    this.email = email;
    this.loginStatus = false;
  }
  getUserId() { return this.userId; }
  getPassword() { return this.password; }
  getEmail() { return this.email; }
  isLoggedIn() { return this.loginStatus; }
  setLoginStatus(status) { this.loginStatus = status; }
}

class FinancialIndicator {
  constructor(per, roe, pbr, psr) {
    this.per = per;
    this.roe = roe;
    this.pbr = pbr;
    this.psr = psr;
  }
  getPER() { return this.per; }
  getROE() { return this.roe; }
  getPBR() { return this.pbr; }
  getPSR() { return this.psr; }
}

class Company {
  constructor(companyId, companyName, industry, description, indicator) {
    this.companyId = companyId;
    this.companyName = companyName;
    this.industry = industry;
    this.description = description;
    this.indicator = indicator;
  }
  getCompanyId() { return this.companyId; }
  getCompanyName() { return this.companyName; }
  getIndustry() { return this.industry; }
  getDescription() { return this.description; }
  getIndicator() { return this.indicator; }
}

class DataStorage {
  constructor() {
    this.userStorageKey = "ssiv_users";
    this.currentUserKey = "ssiv_current_user";
    this.companyData = [];
  }

  // file:// 로 직접 열어도 동작하도록 fallback 데이터를 companies.json과 동일하게 유지한다.
  getFallbackData() {
    return [
      { companyId: "samsung", companyName: "삼성전자", industry: "반도체 / 전자", description: "국내 대표 전자 및 반도체 기업이다.", per: 15.2, roe: 12.5, pbr: 1.3, psr: 2.1 },
      { companyId: "skhynix", companyName: "SK하이닉스", industry: "반도체", description: "메모리 반도체를 중심으로 사업을 운영하는 기업이다.", per: 18.7, roe: 10.8, pbr: 1.6, psr: 2.5 },
      { companyId: "hyundai", companyName: "현대자동차", industry: "자동차", description: "자동차 제조와 모빌리티 사업을 중심으로 하는 기업이다.", per: 7.8, roe: 13.4, pbr: 0.8, psr: 0.6 },
      { companyId: "naver", companyName: "NAVER", industry: "인터넷 / 플랫폼", description: "검색, 커머스, 콘텐츠, 클라우드 사업을 운영하는 플랫폼 기업이다.", per: 28.5, roe: 8.9, pbr: 1.5, psr: 3.2 },
      { companyId: "kakao", companyName: "카카오", industry: "인터넷 / 플랫폼", description: "메신저, 콘텐츠, 모빌리티, 금융 서비스를 운영하는 플랫폼 기업이다.", per: 34.1, roe: 5.2, pbr: 1.2, psr: 2.8 }
    ];
  }

  async loadCompanyData() {
    let rawData = this.getFallbackData();

    try {
      if (location.protocol !== "file:") {
        const response = await fetch("data/companies.json");
        if (!response.ok) throw new Error("companies.json load failed");
        rawData = await response.json();
      }
    } catch (error) {
      console.warn("companies.json 을 불러오지 못해 내장 예시 데이터를 사용합니다.", error);
    }

    this.companyData = rawData.map((item) => {
      const indicator = new FinancialIndicator(item.per, item.roe, item.pbr, item.psr);
      return new Company(item.companyId, item.companyName, item.industry, item.description, indicator);
    });

    return this.companyData;
  }

  getUsers() {
    const saved = localStorage.getItem(this.userStorageKey);
    return saved ? JSON.parse(saved) : [];
  }
  saveUsers(users) { localStorage.setItem(this.userStorageKey, JSON.stringify(users)); }
  saveUser(user) {
    const users = this.getUsers();
    users.push({ userId: user.getUserId(), password: user.getPassword(), email: user.getEmail() });
    this.saveUsers(users);
  }
  findUserById(id) { return this.getUsers().find((u) => u.userId === id); }
  validateUser(id, password) {
    return this.getUsers().find((u) => u.userId === id && u.password === password);
  }
  saveCurrentUser(userId) { localStorage.setItem(this.currentUserKey, userId); }
  getCurrentUserId() { return localStorage.getItem(this.currentUserKey); }
  clearCurrentUser() { localStorage.removeItem(this.currentUserKey); }
  findCompanyById(companyId) { return this.companyData.find((c) => c.getCompanyId() === companyId); }
  getCompanyData() { return this.companyData; }
}

class Registration {
  constructor(dataStorage) { this.dataStorage = dataStorage; }
  validateInput(id, password, email) { return Boolean(id && password && email); }
  checkDuplicateId(id) { return Boolean(this.dataStorage.findUserById(id)); }
  registerUser(id, password, email) {
    if (!this.validateInput(id, password, email)) {
      return { success: false, message: "회원가입 정보를 모두 입력하세요." };
    }
    if (this.checkDuplicateId(id)) {
      return { success: false, message: "이미 존재하는 ID입니다." };
    }
    this.dataStorage.saveUser(new User(id, password, email));
    return { success: true, message: "회원가입이 완료되었습니다. 로그인하세요." };
  }
}

class Login {
  constructor(dataStorage) { this.dataStorage = dataStorage; }
  loginCheck(id, password) {
    if (!id || !password) {
      return { success: false, message: "ID와 Password를 입력하세요." };
    }
    const found = this.dataStorage.validateUser(id, password);
    if (!found) {
      return { success: false, message: "ID 또는 Password가 올바르지 않습니다." };
    }
    const user = new User(found.userId, found.password, found.email);
    user.setLoginStatus(true);
    this.dataStorage.saveCurrentUser(user.getUserId());
    return { success: true, message: "로그인에 성공했습니다.", user };
  }
  showLoginError() { return "로그인에 실패했습니다."; }
  showLoginSuccess() { return "로그인에 성공했습니다."; }
}

class CompanySelector {
  constructor(dataStorage) {
    this.dataStorage = dataStorage;
    this.selectedCompanyId = "";
  }
  loadCompanyList() { return this.dataStorage.getCompanyData(); }
  selectCompany(companyId) {
    this.selectedCompanyId = companyId;
    return this.dataStorage.findCompanyById(companyId);
  }
  getSelectedCompany() { return this.dataStorage.findCompanyById(this.selectedCompanyId); }
}

class CompanyInformation {
  constructor(company) { this.company = company; }
  showCompanyName() { return this.company.getCompanyName(); }
  showIndustry() { return this.company.getIndustry(); }
  showDescription() { return this.company.getDescription(); }
  displayCompanyInfo() {
    return `
      <div class="info-row"><span class="k">기업명</span><span class="v">${this.showCompanyName()}</span></div>
      <div class="info-row"><span class="k">업종</span><span class="v">${this.showIndustry()}</span></div>
      <div class="info-row"><span class="k">설명</span><span class="v">${this.showDescription()}</span></div>
    `;
  }
}

class PERSearch {
  constructor(company) {
    this.company = company;
    this.perValue = null;
  }
  searchPER() {
    if (!this.company) return null;
    this.perValue = this.company.getIndicator().getPER();
    return this.perValue;
  }
  displayPER(per) {
    return `
      <div class="metric-hero"><span class="num">${fmt(per)}</span><span class="cap">PER</span></div>
      <p class="metric-note">${this.company.getCompanyName()}의 주가수익비율입니다.</p>
    `;
  }
  showPERError() { return "PER 정보를 불러올 수 없습니다."; }
}

class IndicatorAnalysis {
  constructor(perValue) {
    this.perValue = perValue;
    this.analysisResult = "";
    this.grade = "";
    this.badgeClass = "";
  }
  analyzePER() {
    if (this.perValue < 10) {
      this.grade = "저평가 가능성";
      this.badgeClass = "badge-low";
      this.analysisResult = "PER이 10보다 낮으므로 단순 기준에서는 저평가 가능성이 있는 상태로 볼 수 있습니다.";
    } else if (this.perValue <= 25) {
      this.grade = "적정 수준";
      this.badgeClass = "badge-mid";
      this.analysisResult = "PER이 10 이상 25 이하이므로 단순 기준에서는 적정 수준으로 볼 수 있습니다.";
    } else {
      this.grade = "고평가 가능성";
      this.badgeClass = "badge-high";
      this.analysisResult = "PER이 25보다 높으므로 단순 기준에서는 고평가 가능성이 있는 상태로 볼 수 있습니다.";
    }
    return this.analysisResult;
  }
  createAnalysisText() { return this.analysisResult; }
  displayAnalysisResult() {
    return `
      <div class="metric-hero" style="margin-bottom:12px">
        <span class="num" style="font-size:26px">${fmt(this.perValue)}</span>
        <span class="badge ${this.badgeClass}">${this.grade}</span>
      </div>
      <p class="analysis-text">${this.analysisResult}</p>
    `;
  }
}

class AdditionalIndicatorSearch {
  constructor(company) { this.company = company; }
  searchROE() { return this.company.getIndicator().getROE(); }
  searchPBR() { return this.company.getIndicator().getPBR(); }
  searchPSR() { return this.company.getIndicator().getPSR(); }
  displayAdditionalIndicators() {
    return `
      <div class="mini-grid">
        <div class="mini-cell"><div class="mk">ROE</div><div class="mv">${fmt(this.searchROE())}%</div></div>
        <div class="mini-cell"><div class="mk">PBR</div><div class="mv">${fmt(this.searchPBR())}</div></div>
        <div class="mini-cell"><div class="mk">PSR</div><div class="mv">${fmt(this.searchPSR())}</div></div>
      </div>
      <div class="desc-list">
        <span class="d"><b>ROE</b> 자기자본 대비 순이익 비율 (수익성)</span>
        <span class="d"><b>PBR</b> 자산 대비 주가 수준</span>
        <span class="d"><b>PSR</b> 매출 대비 주가 수준</span>
      </div>
    `;
  }
}

class CompanyComparison {
  constructor(firstCompany, secondCompany) {
    this.firstCompany = firstCompany;
    this.secondCompany = secondCompany;
    this.comparisonResult = "";
  }
  comparePER() {
    const a = this.firstCompany.getIndicator().getPER();
    const b = this.secondCompany.getIndicator().getPER();
    const nameA = this.firstCompany.getCompanyName();
    const nameB = this.secondCompany.getCompanyName();
    if (a < b) {
      this.comparisonResult = `${attachParticle(nameA, "은", "는")} ${nameB}보다 PER이 낮으므로, PER 기준으로는 상대적으로 낮은 평가를 받고 있을 가능성이 있습니다.`;
    } else if (a > b) {
      this.comparisonResult = `${attachParticle(nameB, "은", "는")} ${nameA}보다 PER이 낮으므로, PER 기준으로는 상대적으로 낮은 평가를 받고 있을 가능성이 있습니다.`;
    } else {
      this.comparisonResult = "두 기업의 PER 값이 동일합니다.";
    }
    return this.comparisonResult;
  }

  compareIndicators() {
    const fi1 = this.firstCompany.getIndicator();
    const fi2 = this.secondCompany.getIndicator();
    return {
      first: { per: fi1.getPER(), roe: fi1.getROE(), pbr: fi1.getPBR(), psr: fi1.getPSR() },
      second: { per: fi2.getPER(), roe: fi2.getROE(), pbr: fi2.getPBR(), psr: fi2.getPSR() },
      result: this.comparePER()
    };
  }
  displayComparisonResult() {
    const c = this.compareIndicators();
    const nameA = this.firstCompany.getCompanyName();
    const nameB = this.secondCompany.getCompanyName();

    const aLower = c.first.per < c.second.per;
    const bLower = c.second.per < c.first.per;
    return `
      <table class="cmp-table">
        <thead>
          <tr><th>지표</th><th>${nameA}</th><th>${nameB}</th></tr>
        </thead>
        <tbody>
          <tr><td>PER</td><td class="${aLower ? "lower" : ""}">${fmt(c.first.per)}</td><td class="${bLower ? "lower" : ""}">${fmt(c.second.per)}</td></tr>
          <tr><td>ROE</td><td>${fmt(c.first.roe)}%</td><td>${fmt(c.second.roe)}%</td></tr>
          <tr><td>PBR</td><td>${fmt(c.first.pbr)}</td><td>${fmt(c.second.pbr)}</td></tr>
          <tr><td>PSR</td><td>${fmt(c.first.psr)}</td><td>${fmt(c.second.psr)}</td></tr>
        </tbody>
      </table>
      <p class="cmp-summary">${c.result} 단, 실제 투자 판단에는 다른 지표와 시장 상황도 함께 고려해야 합니다.</p>
    `;
  }
}

class ResetManager {
  clearSelectedCompany(mainSystem) {
    mainSystem.selectedCompany = null;
    mainSystem.currentPER = null;
  }
  clearIndicatorResult(dom) {
    dom.perResult.innerHTML = `<p class="placeholder">PER 조회 결과가 표시됩니다.</p>`;
    dom.additionalResult.innerHTML = `<p class="placeholder">ROE · PBR · PSR 결과가 표시됩니다.</p>`;
  }
  clearAnalysisResult(dom) {
    dom.analysisResult.innerHTML = `<p class="placeholder">PER 해석 결과가 표시됩니다.</p>`;
  }
  clearComparisonResult(dom) {
    dom.comparisonResult.innerHTML = `<p class="placeholder">두 기업을 선택하면 비교 결과가 표시됩니다.</p>`;
  }
  resetScreen(mainSystem, dom) {
    this.clearSelectedCompany(mainSystem);
    this.clearIndicatorResult(dom);
    this.clearAnalysisResult(dom);
    this.clearComparisonResult(dom);
    dom.companySelect.value = "";
    dom.compareSelect.value = "";
    dom.companyInfo.innerHTML = `<p class="placeholder">기업을 선택한 뒤 ‘기업 정보’ 버튼을 누르세요.</p>`;
  }
}

class MainSystem {
  constructor() {
    this.dataStorage = new DataStorage();
    this.registration = new Registration(this.dataStorage);
    this.login = new Login(this.dataStorage);
    this.companySelector = new CompanySelector(this.dataStorage);
    this.resetManager = new ResetManager();

    this.currentUser = null;
    this.selectedCompany = null;
    this.comparisonCompany = null;
    this.currentPER = null;

    this.dom = this.getDomElements();
  }

  getDomElements() {
    return {
      authView: document.getElementById("auth-view"),
      appView: document.getElementById("app-view"),
      showLoginBtn: document.getElementById("show-login-btn"),
      showRegisterBtn: document.getElementById("show-register-btn"),
      loginPanel: document.getElementById("login-panel"),
      registerPanel: document.getElementById("register-panel"),
      authMessage: document.getElementById("auth-message"),
      appMessage: document.getElementById("app-message"),
      loginId: document.getElementById("login-id"),
      loginPassword: document.getElementById("login-password"),
      registerId: document.getElementById("register-id"),
      registerPassword: document.getElementById("register-password"),
      registerEmail: document.getElementById("register-email"),
      companySelect: document.getElementById("company-select"),
      compareSelect: document.getElementById("compare-select"),
      welcomeText: document.getElementById("welcome-text"),
      companyInfo: document.getElementById("company-info"),
      perResult: document.getElementById("per-result"),
      analysisResult: document.getElementById("analysis-result"),
      additionalResult: document.getElementById("additional-result"),
      comparisonResult: document.getElementById("comparison-result")
    };
  }

  async startSystem() {
    await this.dataStorage.loadCompanyData();
    this.renderCompanyOptions();
    this.bindEvents();

    const savedUserId = this.dataStorage.getCurrentUserId();
    if (savedUserId) this.moveToMain(savedUserId);
    else this.moveToLogin();
  }

  bindEvents() {
    this.dom.showLoginBtn.addEventListener("click", () => this.moveToLogin());
    this.dom.showRegisterBtn.addEventListener("click", () => this.moveToRegister());
    document.getElementById("register-btn").addEventListener("click", () => this.handleRegister());
    document.getElementById("login-btn").addEventListener("click", () => this.handleLogin());
    document.getElementById("logout-btn").addEventListener("click", () => this.handleLogout());

    this.dom.companySelect.addEventListener("change", () => this.selectCompany(this.dom.companySelect.value));

    document.getElementById("info-btn").addEventListener("click", () => this.showCompanyInfo());
    document.getElementById("per-btn").addEventListener("click", () => this.searchPER());
    document.getElementById("analysis-btn").addEventListener("click", () => this.analyzePER());
    document.getElementById("additional-btn").addEventListener("click", () => this.searchAdditionalIndicators());
    document.getElementById("compare-btn").addEventListener("click", () => this.compareCompanies());
    document.getElementById("reset-btn").addEventListener("click", () => this.resetScreen());


    this.dom.loginPassword.addEventListener("keydown", (e) => { if (e.key === "Enter") this.handleLogin(); });
    this.dom.registerEmail.addEventListener("keydown", (e) => { if (e.key === "Enter") this.handleRegister(); });
  }

  renderCompanyOptions() {
    const list = this.companySelector.loadCompanyList();
    list.forEach((company) => {
      const opt = document.createElement("option");
      opt.value = company.getCompanyId();
      opt.textContent = company.getCompanyName();
      this.dom.companySelect.appendChild(opt);

      const opt2 = document.createElement("option");
      opt2.value = company.getCompanyId();
      opt2.textContent = company.getCompanyName();
      this.dom.compareSelect.appendChild(opt2);
    });
  }

  moveToLogin() {
    this.dom.authView.classList.remove("hidden");
    this.dom.appView.classList.add("hidden");
    this.dom.loginPanel.classList.remove("hidden");
    this.dom.registerPanel.classList.add("hidden");
    this.dom.showLoginBtn.classList.add("active");
    this.dom.showRegisterBtn.classList.remove("active");
    this.setAuthMessage("");
  }

  moveToRegister() {
    this.dom.registerPanel.classList.remove("hidden");
    this.dom.loginPanel.classList.add("hidden");
    this.dom.showRegisterBtn.classList.add("active");
    this.dom.showLoginBtn.classList.remove("active");
    this.setAuthMessage("");
  }

  moveToMain(userId) {
    this.dom.authView.classList.add("hidden");
    this.dom.appView.classList.remove("hidden");
    this.dom.welcomeText.textContent = `${userId}님`;
    this.setAuthMessage("");
  }

  handleRegister() {
    const id = this.dom.registerId.value.trim();
    const password = this.dom.registerPassword.value.trim();
    const email = this.dom.registerEmail.value.trim();

    const result = this.registration.registerUser(id, password, email);
    if (!result.success) { this.setAuthMessage(result.message, "error"); return; }

    this.dom.registerId.value = "";
    this.dom.registerPassword.value = "";
    this.dom.registerEmail.value = "";
    this.moveToLogin();
    this.setAuthMessage(result.message, "success");
  }

  handleLogin() {
    const id = this.dom.loginId.value.trim();
    const password = this.dom.loginPassword.value.trim();

    const result = this.login.loginCheck(id, password);
    if (!result.success) { this.setAuthMessage(result.message, "error"); return; }

    this.currentUser = result.user;
    this.dom.loginPassword.value = "";
    this.moveToMain(this.currentUser.getUserId());
  }

  handleLogout() {
    this.dataStorage.clearCurrentUser();
    this.currentUser = null;
    this.resetManager.resetScreen(this, this.dom);
    this.dom.loginId.value = "";
    this.dom.loginPassword.value = "";
    this.moveToLogin();
    this.setAuthMessage("로그아웃되었습니다.", "success");
  }

  selectCompany(companyId) {
    this.selectedCompany = this.companySelector.selectCompany(companyId);
    this.currentPER = null;
    if (!this.selectedCompany) { this.setAppMessage("기업을 선택하세요.", "error"); return; }
    const name = this.selectedCompany.getCompanyName();
    this.setAppMessage(`${attachParticle(name, "이", "가")} 선택되었습니다.`, "success");
  }

  requireSelectedCompany() {
    if (!this.selectedCompany) { this.setAppMessage("먼저 기업을 선택하세요.", "error"); return false; }
    return true;
  }

  showCompanyInfo() {
    if (!this.requireSelectedCompany()) return;
    const info = new CompanyInformation(this.selectedCompany);
    this.dom.companyInfo.innerHTML = info.displayCompanyInfo();
    this.setAppMessage("기업 정보가 표시되었습니다.", "success");
  }

  searchPER() {
    if (!this.requireSelectedCompany()) return;
    const perSearch = new PERSearch(this.selectedCompany);
    const per = perSearch.searchPER();
    if (per === null || per === undefined) { this.setAppMessage(perSearch.showPERError(), "error"); return; }
    this.currentPER = per;
    this.dom.perResult.innerHTML = perSearch.displayPER(per);
    this.setAppMessage("PER 조회가 완료되었습니다.", "success");
  }

  analyzePER() {
    if (!this.requireSelectedCompany()) return;
    if (this.currentPER === null) {
      this.currentPER = new PERSearch(this.selectedCompany).searchPER();
    }
    const analysis = new IndicatorAnalysis(this.currentPER);
    analysis.analyzePER();
    this.dom.analysisResult.innerHTML = analysis.displayAnalysisResult();
    this.setAppMessage("PER 해석이 완료되었습니다.", "success");
  }

  searchAdditionalIndicators() {
    if (!this.requireSelectedCompany()) return;
    const add = new AdditionalIndicatorSearch(this.selectedCompany);
    this.dom.additionalResult.innerHTML = add.displayAdditionalIndicators();
    this.setAppMessage("추가 지표 조회가 완료되었습니다.", "success");
  }

  compareCompanies() {
    if (!this.requireSelectedCompany()) return;
    const compareId = this.dom.compareSelect.value;
    this.comparisonCompany = this.dataStorage.findCompanyById(compareId);

    if (!this.comparisonCompany) { this.setAppMessage("비교할 기업을 선택하세요.", "error"); return; }
    if (this.selectedCompany.getCompanyId() === this.comparisonCompany.getCompanyId()) {
      this.setAppMessage("서로 다른 두 기업을 선택하세요.", "error"); return;
    }

    const comparison = new CompanyComparison(this.selectedCompany, this.comparisonCompany);
    this.dom.comparisonResult.innerHTML = comparison.displayComparisonResult();
    this.setAppMessage("기업 비교가 완료되었습니다.", "success");
  }

  resetScreen() {
    this.resetManager.resetScreen(this, this.dom);
    this.setAppMessage("화면이 초기화되었습니다.", "success");
  }

  setAuthMessage(text, type = "") {
    this.dom.authMessage.textContent = text;
    this.dom.authMessage.className = `message ${type}`;
  }
  setAppMessage(text, type = "") {
    this.dom.appMessage.textContent = text;
    this.dom.appMessage.className = `message inline ${type}`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const mainSystem = new MainSystem();
  mainSystem.startSystem();
});
