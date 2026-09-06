// SAHAYAKBot - AI Cooperative Governance & Legal Platform (SIH26088)

let knowledgeBase = [];
let isRecording = false;
let recognition = null;
let currentLanguage = 'hi-IN';
let speechRate = 1.0;
let geminiApiKey = localStorage.getItem('sahakar_gemini_key') || '';
let availableVoices = [];
let hindiVoice = null;
let currentAudio = null;
let isVoicePlaying = false;
let voiceSessionId = 0;
let activeSpeechBubbleBtn = null;

// DOM Elements
const chatContainer = document.getElementById('chatContainer');
const micBtn = document.getElementById('micBtn');
const stopVoiceBtn = document.getElementById('stopVoiceBtn');
const textInput = document.getElementById('textInput');
const sendBtn = document.getElementById('sendBtn');
const voiceStatus = document.getElementById('voiceStatus');
const visualizer = document.getElementById('visualizer');
const languageSelect = document.getElementById('languageSelect');
const toggleFullscreenBtn = document.getElementById('toggleFullscreenBtn');
const kioskWrapper = document.getElementById('kioskWrapper');
const receiptModal = document.getElementById('receiptModal');
const closeReceiptBtn = document.getElementById('closeReceiptBtn');
const printSlipBtn = document.getElementById('printSlipBtn');
const whatsappSlipBtn = document.getElementById('whatsappSlipBtn');
const receiptSubject = document.getElementById('receiptSubject');
const receiptDetails = document.getElementById('receiptDetails');
const receiptDate = document.getElementById('receiptDate');
const receiptRef = document.getElementById('receiptRef');
const settingsModal = document.getElementById('settingsModal');
const openSettingsBtn = document.getElementById('openSettingsBtn');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const saveSettingsBtn = document.getElementById('saveSettingsBtn');
const geminiApiKeyInput = document.getElementById('geminiApiKeyInput');
const speechRateRange = document.getElementById('speechRateRange');

// Omnichannel View Mode Buttons
const btnModeKiosk = document.getElementById('btnModeKiosk');
const btnModePortal = document.getElementById('btnModePortal');
const btnModeMobile = document.getElementById('btnModeMobile');

// KCC 4% Subsidized Loan Calculator Elements
const openKccCalcBtn = document.getElementById('openKccCalcBtn');
const kccCalcModal = document.getElementById('kccCalcModal');
const closeKccCalcBtn = document.getElementById('closeKccCalcBtn');
const kccLoanRange = document.getElementById('kccLoanRange');
const calcLoanValDisplay = document.getElementById('calcLoanValDisplay');
const calcBaseInt = document.getElementById('calcBaseInt');
const calcSubventionAmt = document.getElementById('calcSubventionAmt');
const calcNetInt = document.getElementById('calcNetInt');
const calcSavingsDisplay = document.getElementById('calcSavingsDisplay');
const kccPrintSummaryBtn = document.getElementById('kccPrintSummaryBtn');
const kccWhatsappSummaryBtn = document.getElementById('kccWhatsappSummaryBtn');

// Biometric Login Elements
const biometricBtn = document.getElementById('biometricBtn');
const biometricModal = document.getElementById('biometricModal');
const closeBiometricBtn = document.getElementById('closeBiometricBtn');
const triggerScanBtn = document.getElementById('triggerScanBtn');
const scanZone = document.getElementById('scanZone');
const scannerStatusText = document.getElementById('scannerStatusText');
const farmerProfileCard = document.getElementById('farmerProfileCard');
const logoutFarmerBtn = document.getElementById('logoutFarmerBtn');

// Comprehensive Global UI Translations Dictionary (SIH26088 Omnichannel Platform)
const UI_TRANSLATIONS = {
  'hi-IN': {
    pageTitle: 'सहकार मित्र | AI Cooperative Governance & Legal Platform (SIH26088)',
    modeInfo: 'ऑम्नीचैनल इंटरफेस (Omnichannel Delivery):',
    btnKiosk: 'पंचायत कियोस्क (Kiosk)',
    btnPortal: 'सीएससी वेब पोर्टल (CSC Web)',
    btnMobile: 'मोबाइल ऐप (Mobile PWA)',
    btnWhatsapp: 'व्हाट्सएप बॉट (WhatsApp)',
    statusSpeech: 'Indic Speech: Active',
    statusSync: 'Live Ministry Sync',
    problem: 'SIH-2026 Problem ID: <strong>SIH26088 (Software Edition)</strong>',
    brandTitle: 'SAHAYAKBot (सहायक बॉट)',
    brandSub: 'सहकारिता मंत्रालय | Multilingual Legal & Governance Voice Platform',
    kccCalc: 'KCC 4% कैलकुलेटर',
    receipt: 'पावती पर्ची',
    biometric: 'अंगूठा लॉगिन (Aadhaar)',
    admin: 'Admin',
    welcomeTitle: 'नमस्ते! मैं SAHAYAKBot हूँ।',
    welcomeDesc: 'आप मुझसे पैक्स (PACS) मॉडल उप-नियम 2023, किसान क्रेडिट कार्ड (KCC 4%), फसल बीमा (PMFBY 72-घंटे दावा), या सहकारी समिति लोकपाल से जुड़ी कोई भी कानूनी जानकारी बोलकर या लिखकर पूछ सकते हैं।',
    quickTitle: 'त्वरित प्रश्न (Quick Queries)',
    quickSub: 'नागरिक सीधे क्लिक करके पूछ सकते हैं:',
    chips: [
      { icon: 'fa-users', label: 'PACS नया सदस्य नियम', query: 'PACS में नया सदस्य कैसे बनें?' },
      { icon: 'fa-credit-card', label: 'KCC लोन व 4% ब्याज छूट', query: 'KCC पर 4% ब्याज और लोन के क्या नियम हैं?' },
      { icon: 'fa-cloud-showers-heavy', label: 'PMFBY फसल बीमा क्लेम', query: 'फसल नुकसान होने पर PMFBY में 72 घंटे में क्लेम कैसे करें?' },
      { icon: 'fa-gavel', label: 'समिति में शिकायत व लोकपाल', query: 'सहकारी समिति में शिकायत व लोकपाल नियम क्या हैं?' },
      { icon: 'fa-file-invoice-dollar', label: 'सहारा रिफंड प्रक्रिया', query: 'सहारा रिफंड पोर्टल पर पैसे वापस कैसे मिलेंगे?' }
    ],
    statutoryTitle: 'वैधानिक प्राधिकार (Statutory Authority)',
    statutoryList: [
      '<strong>पैक्स:</strong> मॉडल उप-नियम 2023 (धारा 7)',
      '<strong>KCC:</strong> 4% शुद्ध दर (IS-PRI योजना)',
      '<strong>फसल बीमा:</strong> 72-घंटे क्षति सूचना',
      '<strong>विवाद:</strong> MSCS अधिनियम 2023 (धारा 84)',
      '<strong>डेटा सुरक्षा:</strong> DPDP Act 2023 अनुपालित'
    ],
    voiceStatusReady: 'बोलने के लिए माइक बटन दबाएं (Press Push-to-Talk)',
    voiceStatusListening: 'सुन रहा हूँ... बोलिए (Listening...)',
    voiceStatusProcessing: 'उत्तर तैयार कर रहा हूँ... (Processing...)',
    inputPlaceholder: 'या यहाँ अपना सवाल टाइप करें...',
    sendBtn: 'पूछें',
    stopVoiceBtn: 'रोकें',
    slipPrint: 'प्रिंट / PDF सेव करें',
    slipWa: 'WhatsApp',
    slipClose: 'बंद करें'
  },
  'mr-IN': {
    pageTitle: 'सहकार मित्र | AI सहकारी सुशासन व विधिक प्लॅटफॉर्म (SIH26088)',
    modeInfo: 'ऑम्नीचॅनल वितरण इंटरफेस:',
    btnKiosk: 'पंचायत किऑस्क (Kiosk)',
    btnPortal: 'सीएससी वेब पोर्टल (CSC Web)',
    btnMobile: 'मोबाइल अॅप (Mobile PWA)',
    btnWhatsapp: 'व्हॉट्सअॅप बॉट (WhatsApp)',
    statusSpeech: 'मराठी ध्वनी: सक्रिय',
    statusSync: 'मंत्रालय थेट जोडणी',
    problem: 'SIH-2026 Problem ID: <strong>SIH26088 (Software Edition)</strong>',
    brandTitle: 'SAHAYAKBot (सहायक बॉट)',
    brandSub: 'सहकार मंत्रालय | बहुभाषिक विधिक व सुशासन व्हॉइस प्लॅटफॉर्म',
    kccCalc: 'KCC 4% कॅल्क्युलेटर',
    receipt: 'पावती पावती',
    biometric: 'अंगठा लॉगिन (Aadhaar)',
    admin: 'प्रशासन',
    welcomeTitle: 'नमस्कार! मी SAHAYAKBot आहे.',
    welcomeDesc: 'तुम्ही मला पॅक्स (PACS) मॉडेल उप-नियम 2023, किसान क्रेडिट कार्ड (KCC 4%), पीक विमा (PMFBY 72-तास दावा) किंवा सहकारी समिती लोकपाल संदर्भातील कोणतीही कायदेशीर माहिती बोलून किंवा लिहून विचारू शकता.',
    quickTitle: 'त्वरित प्रश्न (Quick Queries)',
    quickSub: 'नागरिक थेट क्लिक करून विचारू शकतात:',
    chips: [
      { icon: 'fa-users', label: 'PACS नवीन सदस्य नियम', query: 'PACS मध्ये नवीन सदस्य कसे व्हावे?' },
      { icon: 'fa-credit-card', label: 'KCC कर्ज व 4% व्याज सवलत', query: 'KCC वर 4% व्याज आणि कर्जाचे नियम काय आहेत?' },
      { icon: 'fa-cloud-showers-heavy', label: 'PMFBY पीक विमा क्लेम', query: 'पीक नुकसान झाल्यावर PMFBY मध्ये 72 तासांत क्लेम कसा करावा?' },
      { icon: 'fa-gavel', label: 'सहकारी तक्रार व लोकपाल', query: 'सहकारी समितीत तक्रार व लोकपाल नियम काय आहेत?' },
      { icon: 'fa-file-invoice-dollar', label: 'सहारा रिफंड प्रक्रिया', query: 'सहारा रिफंड पोर्टलवर पैसे परत कसे मिळतील?' }
    ],
    statutoryTitle: 'वैधानिक अधिकार (Statutory Authority)',
    statutoryList: [
      '<strong>पॅक्स:</strong> मॉडेल उप-नियम 2023 (कलम 7)',
      '<strong>KCC:</strong> 4% निव्वळ दर (IS-PRI योजना)',
      '<strong>पीक विमा:</strong> 72-तास नुकसान पूर्वसूचना',
      '<strong>वाद निवारण:</strong> MSCS कायदा 2023 (कलम 84)',
      '<strong>माहिती सुरक्षा:</strong> DPDP कायदा 2023 नुसार'
    ],
    voiceStatusReady: 'बोलण्यासाठी माइक बटण दाबा (Press Push-to-Talk)',
    voiceStatusListening: 'ऐकत आहे... बोला (Listening...)',
    voiceStatusProcessing: 'कायदेशीर मार्गदर्शन शोधत आहे...',
    inputPlaceholder: 'किंवा येथे आपला प्रश्न टाईप करा...',
    sendBtn: 'विचारा',
    stopVoiceBtn: 'थांबवा',
    slipPrint: 'प्रिंट / PDF जतन करा',
    slipWa: 'WhatsApp',
    slipClose: 'बंद करा'
  },
  'gu-IN': {
    pageTitle: 'સહકાર મિત્ર | AI સહકારી શાસન અને કાનૂની પ્લેટફોર્મ (SIH26088)',
    modeInfo: 'ઓમ્નીચેનલ ઇન્ટરફેસ (Omnichannel Delivery):',
    btnKiosk: 'પંચાયત કિયોસ્ક (Kiosk)',
    btnPortal: 'સીએસસી વેબ પોર્ટલ (CSC Web)',
    btnMobile: 'મોબાઇલ એપ (Mobile PWA)',
    btnWhatsapp: 'વ્હોટ્સએપ બોટ (WhatsApp)',
    statusSpeech: 'ગુજરાતી વૉઇસ: સક્રિય',
    statusSync: 'મંત્રાલય લાઇવ સિંક',
    problem: 'SIH-2026 Problem ID: <strong>SIH26088 (Software Edition)</strong>',
    brandTitle: 'SAHAYAKBot (સહાયક બોટ)',
    brandSub: 'સહકાર મંત્રાલય | બહુભાષી કાનૂની અને શાસન વૉઇસ પ્લેટફોર્મ',
    kccCalc: 'KCC 4% કેલ્ક્યુલેટર',
    receipt: 'પાવતી સ્લિપ',
    biometric: 'અંગૂઠા લૉગિન (Aadhaar)',
    admin: 'પ્રશાસક',
    welcomeTitle: 'નમસ્તે! હું SAHAYAKBot છું.',
    welcomeDesc: 'તમે મને પેક્સ (PACS) મોડેલ પેટાનિયમો 2023, કિસાન ક્રેડિટ કાર્ડ (KCC 4%), પાક વીમો (PMFBY 72-કલાક દાવો) અથવા સહકારી લોકપાલ વિશે કોઈપણ કાનૂની માહિતી બોલીને અથવા લખીને પૂછી શકો છો.',
    quickTitle: 'ઝડપી પ્રશ્નો (Quick Queries)',
    quickSub: 'નાગરિકો સીધા ક્લિક કરીને પૂછી શકે છે:',
    chips: [
      { icon: 'fa-users', label: 'PACS નવા સભ્ય નિયમ', query: 'PACS માં નવા સભ્ય કેવી રીતે બનવું?' },
      { icon: 'fa-credit-card', label: 'KCC લોન અને 4% વ્યાજ રાહત', query: 'KCC પર 4% વ્યાજ અને લોનના નિયમો શું છે?' },
      { icon: 'fa-cloud-showers-heavy', label: 'PMFBY પાક વીમા ક્લેમ', query: 'પાક નુકસાન થવા પર PMFBY માં 72 કલાકમાં ક્લેમ કેવી રીતે કરવો?' },
      { icon: 'fa-gavel', label: 'મંડળીમાં ફરિયાદ અને લોકપાલ', query: 'સહકારી મંડળીમાં ફરિયાદ અને લોકપાલના નિયમો શું છે?' },
      { icon: 'fa-file-invoice-dollar', label: 'સહારા રિફંડ પ્રક્રિયા', query: 'સહારા રિફંડ પોર્ટલ પર નાણાં કેવી રીતે પાછા મળશે?' }
    ],
    statutoryTitle: 'કાનૂની સત્તા (Statutory Authority)',
    statutoryList: [
      '<strong>પેક્સ:</strong> મોડેલ પેટાનિયમ 2023 (કલમ 7)',
      '<strong>KCC:</strong> 4% શુદ્ધ દર (IS-PRI યોજના)',
      '<strong>પાક વીમો:</strong> 72-કલાક નુકસાન સૂચના',
      '<strong>વિવાદ:</strong> MSCS અધિનિયમ 2023 (કલમ 84)',
      '<strong>ડેટા સુરક્ષા:</strong> DPDP કાયદો 2023 પાલન'
    ],
    voiceStatusReady: 'બોલવા માટે માઇક બટન દબાવો (Press Push-to-Talk)',
    voiceStatusListening: 'સાંભળી રહ્યો છું... બોલો (Listening...)',
    voiceStatusProcessing: 'કાનૂની માર્ગદર્શન મેળવી રહ્યો છું...',
    inputPlaceholder: 'અથવા અહીં તમારો પ્રશ્ન ટાઈપ કરો...',
    sendBtn: 'પૂછો',
    stopVoiceBtn: 'અટકાવો',
    slipPrint: 'પ્રિન્ટ / PDF સાચવો',
    slipWa: 'WhatsApp',
    slipClose: 'બંધ કરો'
  },
  'en-IN': {
    pageTitle: 'Sahakar Mitra | AI Cooperative Governance & Legal Platform (SIH26088)',
    modeInfo: 'Omnichannel Delivery Modes:',
    btnKiosk: 'Panchayat Kiosk',
    btnPortal: 'CSC Web Portal',
    btnMobile: 'Mobile App (PWA)',
    btnWhatsapp: 'WhatsApp Bot',
    statusSpeech: 'English Speech: Active',
    statusSync: 'Live Ministry Telemetry',
    problem: 'SIH-2026 Problem ID: <strong>SIH26088 (Software Edition)</strong>',
    brandTitle: 'SAHAYAKBot (Legal AI)',
    brandSub: 'Ministry of Cooperation | Multilingual Legal & Governance Voice Platform',
    kccCalc: 'KCC 4% Calculator',
    receipt: 'Receipt Slip',
    biometric: 'Biometric Login (Aadhaar)',
    admin: 'Admin Portal',
    welcomeTitle: 'Welcome! I am SAHAYAKBot.',
    welcomeDesc: 'You can ask me any statutory queries regarding PACS Model Bye-Laws 2023, Kisan Credit Card (KCC 4% Subvention), PMFBY Crop Insurance (72-hr claims), or Cooperative Ombudsman by voice or text.',
    quickTitle: 'Quick Queries',
    quickSub: 'Citizens can click directly to ask:',
    chips: [
      { icon: 'fa-users', label: 'PACS Membership Rules', query: 'How to become a new PACS member?' },
      { icon: 'fa-credit-card', label: 'KCC 4% Subvention Loan', query: 'What are the rules for KCC 4% interest subvention loan?' },
      { icon: 'fa-cloud-showers-heavy', label: 'PMFBY Crop Insurance Claim', query: 'How to claim PMFBY crop insurance within 72 hours of damage?' },
      { icon: 'fa-gavel', label: 'Cooperative Ombudsman & Disputes', query: 'What are the grievance and Ombudsman rules in cooperative societies?' },
      { icon: 'fa-file-invoice-dollar', label: 'CRCS Sahara Refund Process', query: 'How to get refund on the CRCS Sahara Refund Portal?' }
    ],
    statutoryTitle: 'Statutory Authority',
    statutoryList: [
      '<strong>PACS:</strong> Model Bye-Laws 2023 (Clause 7)',
      '<strong>KCC:</strong> 4% Net Rate (IS-PRI Scheme)',
      '<strong>Crop Insurance:</strong> 72-Hour Loss Reporting',
      '<strong>Disputes:</strong> MSCS Act 2023 (Section 84)',
      '<strong>Data Privacy:</strong> DPDP Act 2023 Compliant'
    ],
    voiceStatusReady: 'Press mic button to speak (Push-to-Talk)',
    voiceStatusListening: 'Listening... Please speak now...',
    voiceStatusProcessing: 'Retrieving statutory guidance...',
    inputPlaceholder: 'Or type your query here...',
    sendBtn: 'Send',
    stopVoiceBtn: 'Stop',
    slipPrint: 'Print / Save PDF',
    slipWa: 'WhatsApp',
    slipClose: 'Close'
  }
};

// Global Language Applicator (Updates whole UI and active Speech Model)
function applyGlobalLanguage(lang) {
  currentLanguage = lang;
  const langCode = lang.split('-')[0] || 'hi';
  const t = UI_TRANSLATIONS[lang] || UI_TRANSLATIONS['hi-IN'];

  // Update Page Title
  document.title = t.pageTitle;

  // Update Omnichannel Delivery bar
  const elModeInfo = document.getElementById('i18nModeInfo');
  if (elModeInfo) elModeInfo.innerText = t.modeInfo;
  const elKioskBtn = document.getElementById('i18nKioskBtn');
  if (elKioskBtn) elKioskBtn.innerText = t.btnKiosk;
  const elPortalBtn = document.getElementById('i18nPortalBtn');
  if (elPortalBtn) elPortalBtn.innerText = t.btnPortal;
  const elMobileBtn = document.getElementById('i18nMobileBtn');
  if (elMobileBtn) elMobileBtn.innerText = t.btnMobile;
  const elWhatsappBtn = document.getElementById('i18nWhatsappBtn');
  if (elWhatsappBtn) elWhatsappBtn.innerText = t.btnWhatsapp;

  // Update Top Telemetry Bar
  const elStatusSpeech = document.getElementById('i18nStatusSpeech');
  if (elStatusSpeech) elStatusSpeech.innerText = t.statusSpeech;
  const elStatusSync = document.getElementById('i18nStatusSync');
  if (elStatusSync) elStatusSync.innerText = t.statusSync;
  const elProblem = document.getElementById('i18nProblem');
  if (elProblem) elProblem.innerHTML = t.problem;

  // Update Header Brand & Actions
  const elBrandTitle = document.getElementById('i18nBrandTitle');
  if (elBrandTitle) elBrandTitle.innerText = t.brandTitle;
  const elBrandSub = document.getElementById('i18nBrandSub');
  if (elBrandSub) elBrandSub.innerText = t.brandSub;

  const elKccCalc = document.getElementById('i18nKccCalc');
  if (elKccCalc) elKccCalc.innerText = t.kccCalc;
  const elReceipt = document.getElementById('i18nReceipt');
  if (elReceipt) elReceipt.innerText = t.receipt;
  const elBiometric = document.getElementById('i18nBiometric');
  if (elBiometric) elBiometric.innerText = t.biometric;
  const elAdminBtn = document.getElementById('i18nAdminBtn');
  if (elAdminBtn) elAdminBtn.innerText = t.admin;

  // Update Welcome Banner
  const elWelcomeTitle = document.getElementById('i18nWelcomeTitle');
  if (elWelcomeTitle) elWelcomeTitle.innerText = t.welcomeTitle;
  const elWelcomeDesc = document.getElementById('i18nWelcomeDesc');
  if (elWelcomeDesc) elWelcomeDesc.innerText = t.welcomeDesc;

  // Update Quick Scenario Chips dynamically
  const elQuickTitle = document.getElementById('i18nQuickTitle');
  if (elQuickTitle) elQuickTitle.innerHTML = '<i class="fa-solid fa-bolt"></i> ' + t.quickTitle;
  const elQuickSub = document.getElementById('i18nQuickSub');
  if (elQuickSub) elQuickSub.innerText = t.quickSub;

  const chipsContainer = document.getElementById('quickScenarioList');
  if (chipsContainer && t.chips) {
    chipsContainer.innerHTML = '';
    t.chips.forEach(chip => {
      const btn = document.createElement('button');
      btn.className = 'topic-card-btn';
      btn.setAttribute('data-query', chip.query);
      btn.innerHTML = `<i class="fa-solid ${chip.icon}"></i> <span>${chip.label}</span>`;
      btn.addEventListener('click', () => handleUserQuery(chip.query));
      chipsContainer.appendChild(btn);
    });
  }

  // Update Statutory Authority Card
  const elStatutoryTitle = document.getElementById('i18nStatutoryTitle');
  if (elStatutoryTitle) elStatutoryTitle.innerHTML = '<i class="fa-solid fa-scale-balanced" style="color: #1a365d;"></i> ' + t.statutoryTitle;

  const statList = document.getElementById('statutoryList');
  if (statList && t.statutoryList) {
    statList.innerHTML = '';
    t.statutoryList.forEach(item => {
      const li = document.createElement('li');
      li.innerHTML = `<i class="fa-solid fa-circle-check" style="color: #15803d;"></i> ${item}`;
      statList.appendChild(li);
    });
  }

  // Update Input Bar
  if (textInput) textInput.placeholder = t.inputPlaceholder;
  const elSendBtn = document.getElementById('i18nSendBtn');
  if (elSendBtn) elSendBtn.innerText = t.sendBtn;
  const elStopVoice = document.getElementById('i18nStopVoice');
  if (elStopVoice) elStopVoice.innerText = t.stopVoiceBtn || 'रोकें';

  // Update Slip Modal buttons
  const elSlipPrint = document.getElementById('i18nSlipPrint');
  if (elSlipPrint) elSlipPrint.innerText = t.slipPrint;
  const elSlipWa = document.getElementById('i18nSlipWa');
  if (elSlipWa) elSlipWa.innerText = t.slipWa;
  const elSlipClose = document.getElementById('i18nSlipClose');
  if (elSlipClose) elSlipClose.innerText = t.slipClose;

  // 1. Sync Top Dropdown
  if (languageSelect && languageSelect.value !== lang) {
    languageSelect.value = lang;
  }

  // 2. Sync Speech Controller Pills
  document.querySelectorAll('.voice-lang-btn').forEach(btn => {
    if (btn.getAttribute('data-lang') === lang) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // 3. Sync Mic Button Interactive Language Badge
  const elMicBadge = document.getElementById('micLangBadge');
  if (elMicBadge) {
    const badgeMap = { 'hi-IN': 'HI', 'mr-IN': 'MR', 'gu-IN': 'GU', 'en-IN': 'EN' };
    elMicBadge.innerText = badgeMap[lang] || 'HI';
  }

  // Update Speech Model Language
  if (recognition) {
    recognition.lang = currentLanguage;
  }
  updateVoiceStatus(t.voiceStatusReady);

  console.log(`[i18n] Global Language updated to: ${lang} (${langCode})`);
}

// Supported language sequence for one-tap cycle on the speech button
const SUPPORTED_LANGS = ['hi-IN', 'mr-IN', 'gu-IN', 'en-IN'];

// Setup Voice Controller Language Controls (Directly on Speech Button)
function setupVoiceLanguageControls() {
  // 1. Language pill buttons right above the mic
  document.querySelectorAll('.voice-lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetLang = btn.getAttribute('data-lang');
      applyGlobalLanguage(targetLang);
      
      // Audible speech confirmation in that language
      if (targetLang === 'mr-IN') speakAnswer('मराठी भाषा निवडली आहे.', 'mr');
      else if (targetLang === 'gu-IN') speakAnswer('ગુજરાતી ભાષા પસંદ કરવામાં આવી છે.', 'gu');
      else if (targetLang === 'en-IN') speakAnswer('English language selected.', 'en');
      else speakAnswer('हिन्दी भाषा चयनित की गई है।', 'hi');
    });
  });

  // 2. Click directly on the Mic Language Badge to cycle through languages
  const elMicBadge = document.getElementById('micLangBadge');
  if (elMicBadge) {
    elMicBadge.addEventListener('click', (e) => {
      e.stopPropagation(); // prevent triggering mic push-to-talk recording
      const currentIndex = SUPPORTED_LANGS.indexOf(currentLanguage);
      const nextIndex = (currentIndex + 1) % SUPPORTED_LANGS.length;
      const nextLang = SUPPORTED_LANGS[nextIndex];
      applyGlobalLanguage(nextLang);

      // Play audio confirmation of switch
      if (nextLang === 'mr-IN') speakAnswer('मराठी भाषा', 'mr');
      else if (nextLang === 'gu-IN') speakAnswer('ગુજરાતી ભાષા', 'gu');
      else if (nextLang === 'en-IN') speakAnswer('English', 'en');
      else speakAnswer('हिन्दी भाषा', 'hi');
    });
  }
}

// Automatic Spoken Language Identification (LID) for Speaker Detection
function detectSpokenLanguage(rawTranscript) {
  if (!rawTranscript) return null;
  const t = rawTranscript.trim().toLowerCase();

  // Pattern 1: Explicit voice switch commands
  if (
    t.includes('मराठीत') || t.includes('मराठी बोला') || t.includes('मराठी करा') || 
    t.includes('मराठी में बोलो') || t.includes('मराठी में बताओ') || t.includes('speak in marathi') ||
    t === 'मराठी' || t.includes('मराठी भाषा')
  ) {
    return 'mr-IN';
  }
  if (
    t.includes('ગુજરાતીમાં') || t.includes('ગુજરાતી બોલો') || t.includes('ગુજરાતી કરો') ||
    t.includes('गुजराती में बोलो') || t.includes('गुजराती में बताओ') || t.includes('speak in gujarati') ||
    t === 'ગુજરાતી' || t === 'गुजराती' || t.includes('ગુજરાતી ભાષા')
  ) {
    return 'gu-IN';
  }
  if (
    t.includes('speak in english') || t.includes('switch to english') || t.includes('in english') || 
    t.includes('english please') || t.includes('अंग्रेजी में बोलो') || t.includes('इंग्लिश में बोलो') ||
    t === 'english' || t === 'अंग्रेजी'
  ) {
    return 'en-IN';
  }
  if (
    t.includes('हिन्दी में बोलो') || t.includes('हिंदी में बोलो') || t.includes('हिन्दी में बताओ') || 
    t.includes('speak in hindi') || t === 'हिन्दी' || t === 'हिंदी' || t.includes('हिन्दी भाषा')
  ) {
    return 'hi-IN';
  }

  // Pattern 2: Gujarati Unicode block (U+0A80 to U+0AFF)
  if (/[\u0A80-\u0AFF]/.test(rawTranscript)) {
    return 'gu-IN';
  }

  // Pattern 3: English / Latin alphabet dominance
  const latinMatches = rawTranscript.match(/[a-zA-Z]/g);
  const devanagariMatches = rawTranscript.match(/[\u0900-\u097F]/g);
  const latinCount = latinMatches ? latinMatches.length : 0;
  const devCount = devanagariMatches ? devanagariMatches.length : 0;

  if (latinCount > 6 && latinCount > devCount) {
    return 'en-IN';
  }

  // Pattern 4: Marathi vs Hindi in Devanagari script
  if (devCount > 0) {
    const marathiTokens = [
      'आहे', 'आहेत', 'नाही', 'नाहीत', 'कसे', 'काय', 'करायचे', 'करायचा', 'करावे',
      'सांगा', 'मिळेल', 'मिळतात', 'मिळणार', 'पाहिजे', 'पाहिजेत', 'होय', 'शेतकरी',
      'पिक', 'कर्ज', 'अर्ज', 'माहिती', 'पॅक्स', 'मदत', 'द्या', 'सांग', 'कोणते',
      'कोणती', 'कधी', 'कसं', 'कुठे', 'झाले', 'झाली', 'दिले', 'केले', 'सभासद',
      'सभासदत्व', 'गावातील', 'माझे', 'माझ्या', 'आमच्या', 'घ्यायचे', 'हवे', 'लागतील',
      'करावी', 'पावती', 'तक्रार', 'विचारा', 'बोला', 'मला'
    ];
    const hindiTokens = [
      'है', 'हैं', 'होगा', 'होगी', 'कैसे', 'क्या', 'क्यों', 'कहाँ', 'बताओ',
      'बताइए', 'मिलेगा', 'मिलेगी', 'चाहिए', 'करना', 'करूँ', 'सकते', 'सकता',
      'हूँ', 'मुझे', 'मेरा', 'मेरी', 'हमारे', 'नियम', 'दीजिए', 'बोलिए'
    ];

    let mScore = 0;
    let hScore = 0;

    for (const token of marathiTokens) {
      if (t.includes(token)) mScore += 2;
    }
    for (const token of hindiTokens) {
      if (t.includes(token)) hScore += 2;
    }

    if (mScore > hScore && mScore > 0) {
      return 'mr-IN';
    } else if (hScore > mScore && hScore > 0) {
      return 'hi-IN';
    }
  }

  return null;
}

// Automatic Voice Intent & Language Detection when user speaks into Mic
function detectAndSwitchVoiceLanguage(rawTranscript) {
  const t = rawTranscript.trim().toLowerCase();

  // Handle explicit switch phrases without query
  if (t === 'मराठी' || t === 'मराठी भाषा' || t === 'मराठीत बोला' || t === 'मराठी में बोलो') {
    applyGlobalLanguage('mr-IN');
    const msg = 'होय, आता मी मराठीत बोलेन. तुमचा प्रश्न विचारा.';
    appendMessage(msg, 'bot', null, 'भाषा बदल (Voice Switch: Marathi)', 'Voice Language Engine');
    speakAnswer(msg, 'mr');
    return true;
  }
  if (t === 'ગુજરાતી' || t === 'गुजराती' || t === 'ગુજરાતીમાં બોલો' || t === 'गुजराती में बोलो') {
    applyGlobalLanguage('gu-IN');
    const msg = 'હા, હવે હું ગુજરાતીમાં બોલીશ. તમારો પ્રશ્ન પૂછો.';
    appendMessage(msg, 'bot', null, 'ભાષા બદલો (Voice Switch: Gujarati)', 'Voice Language Engine');
    speakAnswer(msg, 'gu');
    return true;
  }
  if (t === 'english' || t === 'अंग्रेजी' || t === 'speak in english') {
    applyGlobalLanguage('en-IN');
    const msg = 'Sure! I have switched to English. Please ask your question.';
    appendMessage(msg, 'bot', null, 'Language Switch (Voice: English)', 'Voice Language Engine');
    speakAnswer(msg, 'en');
    return true;
  }
  if (t === 'हिन्दी' || t === 'हिंदी' || t === 'हिन्दी में बोलो') {
    applyGlobalLanguage('hi-IN');
    const msg = 'जी हाँ, अब मैं हिन्दी में बात करूँगा। अपना सवाल पूछिए।';
    appendMessage(msg, 'bot', null, 'भाषा परिवर्तन (Voice Switch: Hindi)', 'Voice Language Engine');
    speakAnswer(msg, 'hi');
    return true;
  }

  // Automatic spoken language detection from speaker query
  const detectedLang = detectSpokenLanguage(rawTranscript);
  if (detectedLang && detectedLang !== currentLanguage) {
    console.log(`[Speaker Auto-Switch] Detected language '${detectedLang}' from speaker transcript.`);
    applyGlobalLanguage(detectedLang);
  }

  return false;
}

// Initialize App
document.addEventListener('DOMContentLoaded', async () => {
  await loadKnowledgeBase();
  initVoices();
  initSpeechRecognition();
  setupEventListeners();
  setupVoiceLanguageControls();
  setupOmnichannelViews();
  setupKccCalculator();
  applyGlobalLanguage(currentLanguage);

  if (geminiApiKey) {
    geminiApiKeyInput.value = geminiApiKey;
  }
});

// Load Voices properly
function initVoices() {
  if ('speechSynthesis' in window) {
    const updateVoices = () => {
      availableVoices = window.speechSynthesis.getVoices();
      hindiVoice = availableVoices.find(v => 
        v.lang === 'hi-IN' || 
        v.lang === 'hi_IN' || 
        v.name.toLowerCase().includes('hindi') || 
        v.name.includes('हिन्दी')
      );
      console.log('Available Voices:', availableVoices.length, '| Hindi Voice detected:', hindiVoice ? hindiVoice.name : 'Using Audio TTS proxy');
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;
  }
}

// Load Knowledge Base
async function loadKnowledgeBase() {
  try {
    const res = await fetch('knowledge_base.json');
    const data = await res.json();
    knowledgeBase = data.faq || [];
    console.log('Knowledge Base loaded:', knowledgeBase.length, 'records');
  } catch (err) {
    console.error('Failed to load knowledge_base.json', err);
  }
}

// Setup Omnichannel View Modes
function setupOmnichannelViews() {
  const modeBtns = [btnModeKiosk, btnModePortal, btnModeMobile];

  function setMode(mode) {
    modeBtns.forEach(b => {
      if (b) b.classList.remove('active');
    });

    if (kioskWrapper) {
      kioskWrapper.classList.remove('view-mobile', 'view-portal');
    }
    document.body.classList.remove('preview-mobile', 'preview-portal');

    if (mode === 'mobile') {
      if (isCurrentlyFullscreen() && document.exitFullscreen) document.exitFullscreen().catch(() => {});
      if (kioskWrapper) kioskWrapper.classList.add('view-mobile');
      document.body.classList.add('preview-mobile');
      if (btnModeMobile) btnModeMobile.classList.add('active');
    } else if (mode === 'portal') {
      if (isCurrentlyFullscreen() && document.exitFullscreen) document.exitFullscreen().catch(() => {});
      if (kioskWrapper) kioskWrapper.classList.add('view-portal');
      document.body.classList.add('preview-portal');
      if (btnModePortal) btnModePortal.classList.add('active');
    } else {
      if (btnModeKiosk) btnModeKiosk.classList.add('active');
      if (!isCurrentlyFullscreen()) toggleFullScreen();
    }
  }

  if (btnModeKiosk) btnModeKiosk.addEventListener('click', () => setMode('kiosk'));
  if (btnModePortal) btnModePortal.addEventListener('click', () => setMode('portal'));
  if (btnModeMobile) btnModeMobile.addEventListener('click', () => setMode('mobile'));
}

// Setup KCC 4% Subvention Calculator
function setupKccCalculator() {
  if (!kccLoanRange) return;

  function updateKccValues(amount) {
    const amt = Number(amount);
    const base7 = amt * 0.07;
    const sub3 = amt * 0.03;
    const net4 = amt * 0.04;

    calcLoanValDisplay.innerText = '₹ ' + amt.toLocaleString('en-IN');
    calcBaseInt.innerText = '₹' + Math.round(base7).toLocaleString('en-IN') + ' / वर्ष';
    calcSubventionAmt.innerText = '₹' + Math.round(sub3).toLocaleString('en-IN') + ' सरकार भरेगी';
    calcNetInt.innerText = '₹' + Math.round(net4).toLocaleString('en-IN') + ' / वर्ष';
    calcSavingsDisplay.innerText = '₹' + Math.round(sub3).toLocaleString('en-IN');
  }

  kccLoanRange.addEventListener('input', (e) => {
    updateKccValues(e.target.value);
  });

  if (openKccCalcBtn) {
    openKccCalcBtn.addEventListener('click', () => {
      kccCalcModal.classList.add('open');
      updateKccValues(kccLoanRange.value);
    });
  }

  if (closeKccCalcBtn) {
    closeKccCalcBtn.addEventListener('click', () => {
      kccCalcModal.classList.remove('open');
    });
  }

  if (kccPrintSummaryBtn) {
    kccPrintSummaryBtn.addEventListener('click', () => {
      const amt = Number(kccLoanRange.value);
      const savings = Math.round(amt * 0.03);
      const details = `ऋण राशि: ₹${amt.toLocaleString('en-IN')}\nसामान्य ब्याज दर: 7.0% (₹${Math.round(amt * 0.07).toLocaleString('en-IN')})\nकेन्द्रीय ब्याज छूट (Subvention): -3.0%\nकिसान को शुद्ध ब्याज दर: 4.0% (₹${Math.round(amt * 0.04).toLocaleString('en-IN')})\n\nकुल वार्षिक बचत: ₹${savings.toLocaleString('en-IN')}\nवैधानिक संदर्भ: RBI IS-PRI दिशा-निर्देश`;
      kccCalcModal.classList.remove('open');
      openThermalSlip('KCC 4% शुद्ध ब्याज व सब्सिडी गणना', details);
    });
  }

  if (kccWhatsappSummaryBtn) {
    kccWhatsappSummaryBtn.addEventListener('click', () => {
      const amt = Number(kccLoanRange.value);
      const savings = Math.round(amt * 0.03);
      const text = `*SAHAYAKBot (सहकारिता मंत्रालय GOI)*\n*KCC 4% शुद्ध ब्याज गणना प्रमाणन:*\n\nऋण राशि: ₹${amt.toLocaleString('en-IN')}\nसामान्य ब्याज: 7% (₹${Math.round(amt * 0.07)})\nकेन्द्रीय छूट (IS-PRI): -3% (₹${savings})\n*किसान हेतु शुद्ध ब्याज: केवल 4% (₹${Math.round(amt * 0.04)}/वर्ष)*\n\n*आपकी कुल वार्षिक बचत: ₹${savings.toLocaleString('en-IN')}*\nहेल्पलाइन: 1800-180-1551\nपोर्टल: https://cooperation.gov.in`;
      window.open('https://api.whatsapp.com/send?text=' + encodeURIComponent(text), '_blank');
    });
  }
}

// Setup Event Listeners
function setupEventListeners() {
  // Mic Push to Talk
  micBtn.addEventListener('click', toggleRecording);

  // Text Send
  sendBtn.addEventListener('click', () => {
    const query = textInput.value.trim();
    if (query) {
      handleUserQuery(query);
      textInput.value = '';
    }
  });

  textInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const query = textInput.value.trim();
      if (query) {
        handleUserQuery(query);
        textInput.value = '';
      }
    }
  });

  // Language Change (Global UI & Speech Model Synchronizer)
  if (languageSelect) {
    languageSelect.addEventListener('change', (e) => {
      applyGlobalLanguage(e.target.value);
    });
  }

  // Stop Voice Trigger Button Listener
  if (stopVoiceBtn) {
    stopVoiceBtn.addEventListener('click', stopVoice);
  }

  // Kiosk Fullscreen toggle
  if (toggleFullscreenBtn) {
    toggleFullscreenBtn.addEventListener('click', toggleFullScreen);
  }

  // Global Escape Key Listener: Stop active voice and close modals
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (isVoicePlaying) stopVoice();
      if (receiptModal && receiptModal.classList.contains('open')) receiptModal.classList.remove('open');
      if (kccCalcModal && kccCalcModal.classList.contains('open')) kccCalcModal.classList.remove('open');
      if (settingsModal && settingsModal.classList.contains('open')) settingsModal.classList.remove('open');
      if (biometricModal && biometricModal.classList.contains('open')) biometricModal.classList.remove('open');
    }
  });

  // Native Fullscreen state change events
  document.addEventListener('fullscreenchange', handleFullscreenChange);
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
  document.addEventListener('mozfullscreenchange', handleFullscreenChange);
  document.addEventListener('MSFullscreenChange', handleFullscreenChange);

  // Scenario chips
  document.querySelectorAll('.scenario-chip, .topic-card-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const query = btn.getAttribute('data-query');
      if (query) handleUserQuery(query);
    });
  });

  // Formal Receipt Modal Listeners
  const openReceiptBtn = document.getElementById('openReceiptBtn');
  if (openReceiptBtn) {
    openReceiptBtn.addEventListener('click', () => {
      openThermalSlip('पैक्स उप-नियम एवं सदस्य अधिकार', 'मॉडल उप-नियम 2023, धारा 7 के तहत 30 कार्य दिवस में सदस्यता अनिवार्य निस्तारण।');
    });
  }

  if (closeReceiptBtn) {
    closeReceiptBtn.addEventListener('click', () => {
      if (receiptModal) receiptModal.classList.remove('open');
    });
  }

  if (printSlipBtn) {
    printSlipBtn.addEventListener('click', () => {
      window.print();
    });
  }

  // Settings
  if (openSettingsBtn) {
    openSettingsBtn.addEventListener('click', () => {
      settingsModal.classList.add('open');
    });
  }

  if (closeSettingsBtn) {
    closeSettingsBtn.addEventListener('click', () => {
      settingsModal.classList.remove('open');
    });
  }

  saveSettingsBtn.addEventListener('click', () => {
    geminiApiKey = geminiApiKeyInput.value.trim();
    localStorage.setItem('sahakar_gemini_key', geminiApiKey);
    speechRate = parseFloat(speechRateRange.value);
    settingsModal.classList.remove('open');
    alert('सेटिंग्स सुरक्षित कर ली गईं! (Settings Saved)');
  });

  // Biometric Modal Listeners
  if (biometricBtn) {
    biometricBtn.addEventListener('click', () => {
      biometricModal.classList.add('open');
      scanZone.classList.remove('scanning', 'active');
      scannerStatusText.innerText = 'कृपया अपना अंगूठा बायोमेट्रिक सेंसर पर रखें...';
      triggerScanBtn.disabled = false;
    });
  }

  if (closeBiometricBtn) {
    closeBiometricBtn.addEventListener('click', () => {
      biometricModal.classList.remove('open');
    });
  }

  if (triggerScanBtn) {
    triggerScanBtn.addEventListener('click', () => {
      triggerScanBtn.disabled = true;
      scanZone.classList.add('scanning', 'active');
      scannerStatusText.innerText = 'बायोमेट्रिक स्कैनिंग जारी है... (Aadhaar UIDAI Match)';

      setTimeout(() => {
        scannerStatusText.innerHTML = '<span style="color: #10b981; font-weight: bold;">✔ पहचान सत्यापित! रमेश कुमार (सोनीपत PACS)</span>';

        setTimeout(() => {
          biometricModal.classList.remove('open');
          if (farmerProfileCard) {
            farmerProfileCard.style.display = 'block';
          }

          const welcomeFarmer = `नमस्ते रमेश कुमार जी! आपकी सोनीपत पैक्स (PACS-HR-9042) सदस्यता सत्यापित हो गई है। आपके KCC खाते में ₹1,80,000 की लिमिट व ₹45,000 का बकाया है (4% ब्याज दर)। आपका 1 फसल बीमा क्लेम लंबित है। क्या सहायता चाहिए?`;
          appendMessage(welcomeFarmer, 'bot', null, 'किसान बायोमेट्रिक प्रमाणीकरण', 'PACS Core Banking Integration');
          speakAnswer(welcomeFarmer, 'hi');
        }, 1200);
      }, 1600);
    });
  }

  if (logoutFarmerBtn) {
    logoutFarmerBtn.addEventListener('click', () => {
      if (farmerProfileCard) {
        farmerProfileCard.style.display = 'none';
      }
      appendMessage('किसान प्रोफाइल लॉगआउट कर दी गई है।', 'bot', null, '', 'System');
    });
  }
}

// Proper HTML5 Native Browser Fullscreen Controller (F11 Full Monitor Experience)
function isCurrentlyFullscreen() {
  return !!(
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement
  );
}

function handleFullscreenChange() {
  const isFs = isCurrentlyFullscreen();

  if (toggleFullscreenBtn) {
    toggleFullscreenBtn.classList.toggle('active', isFs);
    const icon = toggleFullscreenBtn.querySelector('i');
    if (icon) {
      icon.className = isFs ? 'fa-solid fa-compress' : 'fa-solid fa-expand';
      toggleFullscreenBtn.setAttribute('title', isFs ? 'पूर्ण स्क्रीन से बाहर निकलें (Exit Fullscreen - Esc)' : 'पूर्ण स्क्रीन (Fullscreen)');
    }
  }

  const badge = document.getElementById('fullscreenActiveBadge');
  if (badge) {
    badge.style.display = isFs ? 'inline-flex' : 'none';
  }

  if (btnModeKiosk) {
    btnModeKiosk.classList.toggle('active', isFs);
  }
}

function toggleFullScreen() {
  const isFs = isCurrentlyFullscreen();

  if (!isFs) {
    const elem = document.documentElement;
    const req = elem.requestFullscreen ||
                elem.webkitRequestFullscreen ||
                elem.mozRequestFullScreen ||
                elem.msRequestFullscreen;
    if (req) {
      req.call(elem).catch(err => {
        console.warn('Native requestFullscreen could not activate:', err);
      });
    }
  } else {
    const exit = document.exitFullscreen ||
                 document.webkitExitFullscreen ||
                 document.mozCancelFullScreen ||
                 document.msExitFullscreen;
    if (exit) {
      exit.call(document).catch(() => {});
    }
  }
}

// Speech Recognition Setup (Web Speech API)
function initSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    voiceStatus.innerText = 'माइक्रोफोन सुविधा केवल Chrome/Edge ब्राउज़र में उपलब्ध है।';
    micBtn.disabled = true;
    return;
  }

  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = currentLanguage;

  recognition.onstart = () => {
    isRecording = true;
    micBtn.classList.add('active-recording');
    visualizer.classList.add('listening');
    updateVoiceStatus(getLocalizedStatus('listening'));
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    console.log('Recognized speech:', transcript);

    // Automatic Voice Command & Language Switch Detection
    const wasHandled = detectAndSwitchVoiceLanguage(transcript);
    if (!wasHandled) {
      handleUserQuery(transcript);
    }
  };

  recognition.onerror = (event) => {
    console.warn('Speech recognition error:', event.error);
    stopRecording();
    updateVoiceStatus('आवाज स्पष्ट नहीं आई। कृपया दोबारा बोलें या टाइप करें।');
  };

  recognition.onend = () => {
    stopRecording();
  };
}

function toggleRecording() {
  stopVoice();
  if (!recognition) return;
  if (isRecording) {
    recognition.stop();
    stopRecording();
  } else {
    try {
      recognition.lang = currentLanguage;
      recognition.start();
    } catch (e) {
      recognition.stop();
      setTimeout(() => recognition.start(), 200);
    }
  }
}

function stopRecording() {
  isRecording = false;
  micBtn.classList.remove('active-recording');
  visualizer.classList.remove('listening');
  updateVoiceStatus(getLocalizedStatus('ready'));
}

function updateVoiceStatus(text) {
  voiceStatus.innerText = text;
}

function getLocalizedStatus(state) {
  const t = UI_TRANSLATIONS[currentLanguage] || UI_TRANSLATIONS['hi-IN'];
  if (state === 'listening') {
    return t.voiceStatusListening;
  }
  if (state === 'processing') {
    return t.voiceStatusProcessing;
  }
  return t.voiceStatusReady;
}

// Query Handling Logic with Speaker Language Auto-Detection
async function handleUserQuery(query) {
  stopVoice();
  appendMessage(query, 'user');
  updateVoiceStatus(getLocalizedStatus('processing'));

  // 1. Immediate client-side speaker language detection
  const detectedByClient = detectSpokenLanguage(query);
  if (detectedByClient && detectedByClient !== currentLanguage) {
    console.log(`[Speaker Auto-Switch] Client detected ${detectedByClient}. Updating UI & speech model.`);
    applyGlobalLanguage(detectedByClient);
  }

  let effectiveLangCode = currentLanguage.split('-')[0] || 'hi';
  const hasDevanagari = /[\u0900-\u097F]/.test(query);
  const isHindiQuery = effectiveLangCode === 'hi' || (hasDevanagari && effectiveLangCode !== 'mr');

  let botReply = '';
  let matchedDoc = null;
  let sourceTag = 'LLaMA-3.2 AI';

  // 1. Try Backend LLaMA 3.2 AI with real-time Ministry Telemetry sync
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        query: query, 
        lang: effectiveLangCode, 
        isHindi: isHindiQuery,
        district: 'सोनीपत (हरियाणा)'
      })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.reply) {
        botReply = data.reply;
        sourceTag = data.source || 'LLaMA-3.2 AI';
      }

      // If backend detected a specific language from query:
      if (data.detected_lang) {
        const backendLangFull = data.detected_lang + '-IN';
        effectiveLangCode = data.detected_lang;
        if (currentLanguage !== backendLangFull) {
          console.log(`[Speaker Auto-Switch] Backend detected ${backendLangFull}. Synchronizing dropdown & UI.`);
          applyGlobalLanguage(backendLangFull);
        }
      }
    }
  } catch (err) {
    console.warn('Backend AI fetch failed, trying fallbacks:', err);
  }

  // 2. Direct Gemini if key entered in settings
  if (!botReply && geminiApiKey) {
    try {
      botReply = await callGeminiLLM(query, isHindiQuery);
      sourceTag = 'Gemini AI';
    } catch (err) {
      console.warn('Gemini call failed:', err);
    }
  }

  // 3. Fallback to local high-precision cooperative RAG with statutory citations
  if (!botReply) {
    const ragResult = queryLocalRAG(query, isHindiQuery, effectiveLangCode);
    botReply = ragResult.reply;
    matchedDoc = ragResult.doc;
    sourceTag = 'Knowledge Base (Offline RAG)';
  }

  appendMessage(botReply, 'bot', matchedDoc, query, sourceTag);
  updateVoiceStatus(getLocalizedStatus('ready'));

  // Speak aloud in detected regional language matching the speaker
  speakAnswer(botReply, effectiveLangCode);
}

// Local RAG Matcher with multilingual statutory citations (Hindi, Marathi, Gujarati, English)
function queryLocalRAG(userText, isHindi, langCode = 'hi') {
  const lowerText = userText.toLowerCase();

  let bestMatch = null;
  let highestScore = 0;

  for (const item of knowledgeBase) {
    let score = 0;
    for (const kw of item.keywords) {
      if (lowerText.includes(kw.toLowerCase())) {
        score += 3;
      }
    }
    if (lowerText.includes(item.question_hi.toLowerCase()) || lowerText.includes(item.question_en.toLowerCase())) {
      score += 6;
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = item;
    }
  }

  if (bestMatch && highestScore > 0) {
    if (langCode === 'en') {
      let reply = bestMatch.answer_en;
      if (!reply.includes('Statutory Ref')) {
        reply += '\n\n⚖️ Statutory Ref: Model Bye-Laws 2023 & Ministry of Cooperation Guidelines';
      }
      return { reply, doc: bestMatch };
    } else if (langCode === 'mr') {
      let reply = bestMatch.answer_hi
        .replace(/है।/g, 'आहे.')
        .replace(/सकते हैं/g, 'शकता.')
        .replace(/किया जाता है/g, 'केले जाते.')
        .replace(/मिलता है/g, 'मिळते.');
      reply += '\n\n⚖️ वैधानिक संदर्भ: मॉडेल उप-नियम 2023 व सहकार मंत्रालय दिशा-निर्देश';
      return { reply, doc: bestMatch };
    } else if (langCode === 'gu') {
      let reply = bestMatch.answer_hi
        .replace(/है।/g, 'છે.')
        .replace(/सकते हैं/g, 'શકો છો.')
        .replace(/किया जाता है/g, 'કરવામાં આવે છે.')
        .replace(/मिलता है/g, 'મળે છે.');
      reply += '\n\n⚖️ કાનૂની સંદર્ભ: મોડેલ પેટાનિયમો 2023 અને સહકાર મંત્રાલય માર્ગદર્શિકા';
      return { reply, doc: bestMatch };
    } else {
      let reply = bestMatch.answer_hi;
      if (!reply.includes('वैधानिक संदर्भ')) {
        reply += '\n\n⚖️ वैधानिक संदर्भ: मॉडल उप-नियम 2023 एवं सहकारिता मंत्रालय निर्देश';
      }
      return { reply, doc: bestMatch };
    }
  }

  // General Regional Fallback
  if (langCode === 'en') {
    return {
      reply: `According to Ministry of Cooperation guidelines:
1. For PACS membership or agricultural credit, valid Aadhaar and local residence are mandatory.
2. For crop damages or insurance, report within 72 hours via PACS or toll-free 14447.
3. Timely repayment of KCC loans yields an effective net interest rate of only 4%.
4. For dispute redressal, consult your local Assistant Registrar of Cooperative Societies (ARCS).

⚖️ Statutory Ref: Model Bye-Laws 2023 (Clause 7) & RBI KCC Subvention Scheme`,
      doc: null
    };
  } else if (langCode === 'mr') {
    return {
      reply: `सहकार मंत्रालय व PACS नियमांनुसार:
1. कोणत्याही प्राथमिक कृषी पतसंस्थेत (PACS) सदस्यत्वासाठी आधार व स्थानिक रहिवासी असणे आवश्यक आहे.
2. पीक नुकसानीसाठी 72 तासांच्या आत स्थानिक PACS किंवा 14447 वर माहिती नोंदवा.
3. KCC कर्जावर वेळेत परतफेड केल्यास केवळ 4% निव्वळ व्याजदराचा लाभ मिळतो.
4. अधिक माहितीसाठी जवळच्या सहायक निबंधक (ARCS) कार्यालयात संपर्क साधा.

⚖️ वैधानिक संदर्भ: मॉडेल उप-नियम 2023 (कलम 7) व RBI KCC व्याज सवलत परिपत्रक`,
      doc: null
    };
  } else if (langCode === 'gu') {
    return {
      reply: `સહકાર મંત્રાલય અને PACS નિયમો અનુસાર:
1. કોઈપણ પ્રાથમિક કૃષિ સહકારી મંડળી (PACS) માં સભ્યપદ માટે આધાર અને સ્થાનિક રહેવાસી હોવું જરૂરી છે.
2. પાક નુકસાન માટે 72 કલાકની અંદર સ્થાનિક PACS અથવા ટોલ-ફ્રી નંબર 14447 પર માહિતી નોંધાવો.
3. KCC લોન પર સમયસર ચૂકવણી કરવાથી માત્ર 4% ચોખ્ખા વ્યાજદરનો લાભ મળે છે.
4. વધુ માહિતી માટે તમારા નજીકના સહાયક રજિસ્ટ્રાર (ARCS) કચેરીનો સંપર્ક કરો.

⚖️ કાનૂની સંદર્ભ: મોડેલ પેટાનિયમો 2023 (કલમ 7) અને RBI KCC વ્યાજ રાહત પરિપત્ર`,
      doc: null
    };
  } else {
    return {
      reply: `सहकारिता मंत्रालय व PACS नियमों के अनुसार:
1. किसी भी सहकारी समिति (PACS, दुग्ध, मत्स्य) में सदस्यता व ऋण के लिए वैध आधार व क्षेत्रीय निवास आवश्यक है।
2. कृषि व फसल संबंधित क्षति के लिए 72 घंटे के भीतर स्थानीय PACS या टोल-फ्री नंबर 14447 पर सूचना दर्ज करें।
3. KCC ऋण पर समय से भुगतान करने पर शुद्ध 4% ब्याज दर का लाभ मिलता है।
4. अधिक जानकारी के लिए अपने नजदीकी ग्राम सेवक या सहायक निबंधक (ARCS) कार्यालय में संपर्क करें।

⚖️ वैधानिक संदर्भ: मॉडल उप-नियम 2023 (धारा 7) एवं RBI KCC ब्याज छूट परिपत्र`,
      doc: null
    };
  }
}

// Call Google Gemini API
async function callGeminiLLM(prompt, isHindi) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;
  
  const targetLang = isHindi ? "HINDI" : "ENGLISH";
  const systemInstruction = `You are 'SAHAYAKBot', an official AI Assistant for the Ministry of Cooperation, Government of India.
CRITICAL: You MUST answer strictly in ${targetLang} language.
Your domain:
- Primary Agricultural Credit Societies (PACS) Model Bye-Laws 2023.
- Kisan Credit Card (KCC) 4% subsidized interest rate rules.
- Pradhan Mantri Fasal Bima Yojana (PMFBY) crop insurance and 72-hour claim window.
- Multi-State Co-operative Societies (MSCS) Act 2023, Cooperative Ombudsman.
- CRCS Sahara Refund Portal.
Include a statutory reference at the end. Keep responses concise and structured in bullet points.`;

  const payload = {
    contents: [
      {
        role: "user",
        parts: [
          { text: `${systemInstruction}\n\nUser Question: ${prompt}` }
        ]
      }
    ]
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  if (data.candidates && data.candidates[0].content.parts[0].text) {
    return data.candidates[0].content.parts[0].text;
  }
  throw new Error('Invalid response from Gemini');
}

// Append Chat Messages
function appendMessage(text, sender, doc = null, originalQuery = '', sourceTag = 'LLaMA-3.2 AI') {
  const bubble = document.createElement('div');
  bubble.className = `message-bubble ${sender === 'user' ? 'user-msg' : 'bot-msg'}`;

  if (sender === 'bot') {
    const badge = document.createElement('div');
    badge.style.fontSize = '0.74rem';
    badge.style.color = '#15803d';
    badge.style.fontWeight = '700';
    badge.style.marginBottom = '6px';
    badge.style.display = 'flex';
    badge.style.alignItems = 'center';
    badge.style.gap = '6px';
    badge.innerHTML = `<i class="fa-solid fa-shield-halved"></i> <span>सहकारिता मंत्रालय विधिक मार्गदर्शन (Ministry Legal Guidance)</span>`;
    bubble.appendChild(badge);
  }

  const contentSpan = document.createElement('div');
  contentSpan.innerText = text;
  bubble.appendChild(contentSpan);

  if (sender === 'bot') {
    const actionsRow = document.createElement('div');
    actionsRow.className = 'bot-actions-row';

    // Print Slip Button
    const printBtn = document.createElement('button');
    printBtn.className = 'btn-receipt';
    printBtn.innerHTML = '<i class="fa-solid fa-print"></i> पर्ची निकालें (Print)';
    printBtn.onclick = () => openThermalSlip(originalQuery || 'सहकारिता मार्गदर्शन', text);

    // WhatsApp Direct Send Button
    const waBtn = document.createElement('button');
    waBtn.className = 'btn-receipt';
    waBtn.style.background = 'rgba(22, 163, 74, 0.2)';
    waBtn.style.borderColor = 'rgba(22, 163, 74, 0.4)';
    waBtn.style.color = '#4ade80';
    waBtn.innerHTML = '<i class="fa-brands fa-whatsapp"></i> WhatsApp';
    waBtn.onclick = () => {
      const waText = `*SAHAYAKBot (सहकारिता मंत्रालय)*\n\n*प्रश्न:* ${originalQuery || 'सहकारिता मार्गदर्शन'}\n\n*उत्तर:*\n${text}\n\nहेल्पलाइन: 1800-180-1551\nhttps://cooperation.gov.in`;
      window.open('https://api.whatsapp.com/send?text=' + encodeURIComponent(waText), '_blank');
    };

    // Speak / Stop Toggle Button
    const hasDevanagari = /[\u0900-\u097F]/.test(text);
    const speakBtn = document.createElement('button');
    speakBtn.className = 'btn-speak-again';
    speakBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i> <span class="btn-speak-label">सुनें</span>';
    speakBtn.onclick = () => {
      if (isVoicePlaying && activeSpeechBubbleBtn === speakBtn) {
        stopVoice();
      } else {
        stopVoice();
        activeSpeechBubbleBtn = speakBtn;
        speakBtn.innerHTML = '<i class="fa-solid fa-stop"></i> <span class="btn-speak-label">रोकें</span>';
        speakBtn.classList.add('speaking');
        speakAnswer(text, hasDevanagari ? 'hi' : 'en');
      }
    };

    actionsRow.appendChild(printBtn);
    actionsRow.appendChild(waBtn);
    actionsRow.appendChild(speakBtn);
    bubble.appendChild(actionsRow);
  }

  chatContainer.appendChild(bubble);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Stop Ongoing Voice Playback (both HTML5 Audio and SpeechSynthesis)
function stopVoice() {
  voiceSessionId++; // Invalidate current session so pending sentence callbacks stop immediately
  isVoicePlaying = false;

  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio.src = '';
    } catch (e) {}
    currentAudio = null;
  }

  if ('speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {}
  }

  setVoiceUIPlaying(false);

  if (activeSpeechBubbleBtn) {
    activeSpeechBubbleBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i> <span class="btn-speak-label">सुनें</span>';
    activeSpeechBubbleBtn.classList.remove('speaking');
    activeSpeechBubbleBtn = null;
  }

  if (voiceStatus) {
    voiceStatus.innerHTML = '<span style="color: #dc2626; font-weight: 700;"><i class="fa-solid fa-circle-stop"></i> आवाज़ रोक दी गई (Voice Stopped)</span>';
    setTimeout(() => {
      if (!isVoicePlaying && !isRecording && voiceStatus) {
        voiceStatus.innerText = getLocalizedStatus('ready');
      }
    }, 1600);
  }
}

// Synchronize Voice UI State (Stop button prominence, visualizer wave, status label)
function setVoiceUIPlaying(isPlaying) {
  isVoicePlaying = isPlaying;
  if (visualizer) {
    visualizer.classList.toggle('listening', isPlaying);
  }
  if (stopVoiceBtn) {
    stopVoiceBtn.classList.toggle('speaking', isPlaying);
    if (isPlaying) {
      stopVoiceBtn.setAttribute('title', 'चलती आवाज़ तुरंत रोकें (Stop Ongoing Voice)');
    } else {
      stopVoiceBtn.setAttribute('title', 'आवाज़ रोकें (Stop Voice)');
    }
  }

  if (!isPlaying) {
    if (activeSpeechBubbleBtn) {
      activeSpeechBubbleBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i> <span class="btn-speak-label">सुनें</span>';
      activeSpeechBubbleBtn.classList.remove('speaking');
      activeSpeechBubbleBtn = null;
    }
  } else {
    if (voiceStatus) {
      voiceStatus.innerHTML = '<span style="color: #15803d; font-weight: 700;"><i class="fa-solid fa-volume-high fa-beat-fade"></i> सहायक बोल रहा है...</span> <button class="btn-status-stop" id="statusStopBtn" type="button"><i class="fa-solid fa-stop"></i> रोकें</button>';
      const statusStopBtn = document.getElementById('statusStopBtn');
      if (statusStopBtn) {
        statusStopBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          stopVoice();
        });
      }
    }
  }
}

// Robust Hindi, Marathi, Gujarati & English Speech Output
function speakAnswer(text, preferredLang = null) {
  stopVoice(); // Clear any previous audio session

  const activeLang = preferredLang || currentLanguage.split('-')[0] || 'hi';

  let spokenText = text
    .replace(/⚖️/g, '')
    .replace(/वैधानिक संदर्भ:.*/g, '')
    .replace(/Statutory Ref:.*/g, '')
    .replace(/\bPACS\b/gi, 'पैक्स')
    .replace(/\bKCC\b/gi, 'केसीसी')
    .replace(/\bPMFBY\b/gi, 'प्रधानमंत्री फसल बीमा योजना')
    .replace(/\bCSC\b/gi, 'कॉमन सर्विस सेंटर')
    .replace(/\bDBT\b/gi, 'डीबीटी')
    .replace(/\bMSCS\b/gi, 'मल्टी स्टेट कोऑपरेटिव')
    .replace(/[*#_~]/g, '')
    .trim();

  if (activeLang === 'en') {
    playWithSpeechSynthesis(spokenText, 'en-IN');
  } else {
    playServerTTS(spokenText, activeLang);
  }
}

// Server-Powered Multilingual TTS (/api/tts proxy)
function playServerTTS(text, lang = 'hi') {
  const mySessionId = ++voiceSessionId;
  setVoiceUIPlaying(true);

  const sentences = text.match(/[^.!?।\n]+[.!?।\n]*/g) || [text];
  let currentIndex = 0;

  function playNextSentence() {
    if (voiceSessionId !== mySessionId) return;

    if (currentIndex >= sentences.length || currentIndex >= 5) {
      if (voiceSessionId === mySessionId) {
        currentAudio = null;
        setVoiceUIPlaying(false);
        if (voiceStatus && !isRecording) {
          voiceStatus.innerText = getLocalizedStatus('ready');
        }
      }
      return;
    }

    const sentence = sentences[currentIndex].trim();
    currentIndex++;

    if (!sentence || sentence.length < 2) {
      playNextSentence();
      return;
    }

    const audioUrl = `/api/tts?lang=${lang}&text=${encodeURIComponent(sentence)}`;
    currentAudio = new Audio(audioUrl);
    currentAudio.playbackRate = speechRate;

    currentAudio.onended = () => {
      if (voiceSessionId === mySessionId) {
        playNextSentence();
      }
    };

    currentAudio.onerror = (e) => {
      if (voiceSessionId !== mySessionId) return;
      console.warn('Backend TTS error, trying browser fallback:', e);
      const utter = new SpeechSynthesisUtterance(sentence);
      utter.lang = `${lang}-IN`;
      utter.rate = speechRate;
      utter.onend = () => {
        if (voiceSessionId === mySessionId) playNextSentence();
      };
      utter.onerror = () => {
        if (voiceSessionId === mySessionId) playNextSentence();
      };
      window.speechSynthesis.speak(utter);
    };

    currentAudio.play().catch(err => {
      if (voiceSessionId !== mySessionId) return;
      console.warn('Audio play catch:', err);
      playNextSentence();
    });
  }

  playNextSentence();
}

// Native SpeechSynthesis playback for English
function playWithSpeechSynthesis(cleanText, langCode, chosenVoice = null) {
  const mySessionId = ++voiceSessionId;
  setVoiceUIPlaying(true);

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = langCode;
  utterance.rate = speechRate;

  if (chosenVoice) {
    utterance.voice = chosenVoice;
  }

  utterance.onend = () => {
    if (voiceSessionId === mySessionId) {
      setVoiceUIPlaying(false);
      if (voiceStatus && !isRecording) {
        voiceStatus.innerText = getLocalizedStatus('ready');
      }
    }
  };
  utterance.onerror = () => {
    if (voiceSessionId === mySessionId) {
      setVoiceUIPlaying(false);
      if (voiceStatus && !isRecording) {
        voiceStatus.innerText = getLocalizedStatus('ready');
      }
    }
  };

  window.speechSynthesis.speak(utterance);
}

// Open Thermal / Formal Government Receipt Modal with WhatsApp Integration
function openThermalSlip(subject, details) {
  const now = new Date();
  const token = 'MOC-' + now.getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
  
  // Legacy fields (if present)
  if (receiptDate) receiptDate.innerText = now.toLocaleString('en-IN');
  if (receiptRef) receiptRef.innerText = token;
  if (receiptSubject) receiptSubject.innerText = subject;
  if (receiptDetails) receiptDetails.innerText = details;

  // Formal Government Slip fields
  const elToken = document.getElementById('slipToken');
  const elCitizen = document.getElementById('slipCitizen');
  const elPacs = document.getElementById('slipPacs');
  const elCategory = document.getElementById('slipCategory');
  const elStatute = document.getElementById('slipStatute');

  if (elToken) elToken.innerText = token;
  if (elCitizen) elCitizen.innerText = 'किसान / पैक्स सदस्य (आधार सत्यापित)';
  if (elPacs) elPacs.innerText = 'सोनीपत प्राथमिक कृषि साख समिति (PACS)';
  if (elCategory) elCategory.innerText = subject;
  if (elStatute) {
    if (details.includes('2023') || subject.includes('सदस्यता') || subject.includes('उप-नियम')) {
      elStatute.innerText = 'मॉडल उप-नियम 2023, धारा 7';
    } else if (subject.includes('KCC') || subject.includes('ऋण')) {
      elStatute.innerText = 'RBI/NABARD IS-PRI योजना (4% शुद्ध ब्याज)';
    } else if (subject.includes('बीमा') || subject.includes('फसल')) {
      elStatute.innerText = 'PMFBY दिशा-निर्देश 2020 (क्लॉज 14.2)';
    } else {
      elStatute.innerText = 'बहु-राज्य सहकारी समिति अधिनियम 2023, धारा 84';
    }
  }

  if (whatsappSlipBtn) {
    whatsappSlipBtn.onclick = () => {
      const waMsg = `*SAHAYAKBot (सहकारिता मंत्रालय, भारत सरकार)*\nपावती टोकन: ${token}\n\n*विषय:* ${subject}\n\n*मार्गदर्शन:*\n${details}\n\n*हेल्पलाइन:* 1800-180-1551\nपोर्टल: https://cooperation.gov.in`;
      window.open('https://api.whatsapp.com/send?text=' + encodeURIComponent(waMsg), '_blank');
    };
  }

  if (receiptModal) receiptModal.classList.add('open');
}
