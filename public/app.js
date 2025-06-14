// DOM Elements
const form = document.getElementById("form");
const form2 = document.getElementById("form2");
const javascriptCode = document.getElementById("javascriptCode");
const lockDomains = document.getElementById("lockDomains");
const output = document.getElementById("output");
const obfuscateAnotherCode = document.getElementById("obfuscateAnotherCode");
const copyBtn = document.getElementById("copyBtn");
const downloadBtn = document.getElementById("downloadBtn");
const securityLevelButtons = document.querySelectorAll(".security-level-btn");
const performanceMeterFill = document.getElementById("performanceMeterFill");

// State
let currentSecurityLevel = "standard";
let lastObfuscatedCode = "";

// Initialize security level buttons
securityLevelButtons.forEach(button => {
  button.addEventListener("click", function() {
    securityLevelButtons.forEach(btn => btn.classList.remove("active"));
    this.classList.add("active");
    currentSecurityLevel = this.dataset.level;
    updateSecurityDescription();
    updatePerformanceMeter();
  });
});

// Security level descriptions and performance indicators
function updateSecurityDescription() {
  const descriptions = {
    basic: {
      text: "Basic obfuscation (minimal protection, fastest performance)",
      performance: 95
    },
    standard: {
      text: "Standard protection (control flow flattening + debug protection)",
      performance: 80
    },
    advanced: {
      text: "Enhanced security (self-defending + identifier mangling)",
      performance: 65
    },
    enterprise: {
      text: "Professional-grade (multiple layers + anti-debugging)",
      performance: 45
    },
    ultra: {
      text: "Maximum security (all techniques + virtualization - slowest)",
      performance: 20
    }
  };
  
  document.getElementById("securityDescription").textContent = descriptions[currentSecurityLevel].text;
  return descriptions[currentSecurityLevel].performance;
}

function updatePerformanceMeter() {
  const performanceLevels = {
    basic: 95,
    standard: 80,
    advanced: 65,
    enterprise: 45,
    ultra: 20
  };
  
  const percentage = performanceLevels[currentSecurityLevel];
  performanceMeterFill.style.width = `${percentage}%`;
  
  // Update color based on performance level
  if (percentage > 70) {
    performanceMeterFill.className = "performance-meter-fill bg-success";
  } else if (percentage > 40) {
    performanceMeterFill.className = "performance-meter-fill bg-warning";
  } else {
    performanceMeterFill.className = "performance-meter-fill bg-danger";
  }
}

// Main obfuscation function
form.onsubmit = async function(event) {
  event.preventDefault();
  
  try {
    // Validate input
    if (!javascriptCode.value.trim()) {
      throw new Error("Please enter JavaScript code to obfuscate");
    }

    // Show loading state
    const submitBtn = this.querySelector("button[type='submit']");
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    submitBtn.disabled = true;

    // Prepare domain lock
    const domainLockArray = lockDomains.value
      .split(",")
      .map(domain => domain.trim())
      .filter(domain => domain);

    // Get obfuscation options
    const obfuscationOptions = getObfuscationOptions(domainLockArray);

    // Obfuscate (with timeout to prevent UI freeze)
    const obfuscationResult = await new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          resolve(JavaScriptObfuscator.obfuscate(javascriptCode.value, obfuscationOptions));
        } catch (error) {
          reject(error);
        }
      }, 100);
    });

    // Add attribution and get obfuscated code
    lastObfuscatedCode = `// Obfuscated with VERONICA Obfuscator PRO (Security Level: ${currentSecurityLevel.toUpperCase()})\n` + 
                         `// ${new Date().toISOString()}\nDev Terrizev contact telegram \nt.me/terrizev\n` +
                         obfuscationResult.getObfuscatedCode();
    
    output.value = lastObfuscatedCode;

    // Switch to results view
    form2.classList.remove("d-none");
    this.classList.add("d-none");

    // Analytics (optional)
    logObfuscationEvent(currentSecurityLevel, domainLockArray.length);

  } catch (error) {
    showError(error.message);
  } finally {
    // Reset button state
    const submitBtn = form.querySelector("button[type='submit']");
    submitBtn.innerHTML = originalBtnText;
    submitBtn.disabled = false;
  }
};

// Obfuscation options by security level
function getObfuscationOptions(domainLockArray) {
  const baseOptions = {
    compact: true,
    controlFlowFlattening: false,
    controlFlowFlatteningThreshold: 0,
    deadCodeInjection: false,
    deadCodeInjectionThreshold: 0,
    debugProtection: false,
    debugProtectionInterval: 0,
    disableConsoleOutput: false,
    identifierNamesGenerator: 'hexadecimal',
    log: false,
    numbersToExpressions: false,
    renameGlobals: false,
    renameProperties: false,
    selfDefending: false,
    simplify: true,
    splitStrings: false,
    splitStringsChunkLength: 10,
    stringArray: true,
    stringArrayEncoding: [],
    stringArrayIndexShift: false,
    stringArrayWrappersCount: 1,
    stringArrayWrappersChainedCalls: false,
    stringArrayThreshold: 0.75,
    target: 'browser',
    transformObjectKeys: false,
    unicodeEscapeSequence: false
  };

  const optionsByLevel = {
    basic: {
      ...baseOptions,
      stringArrayThreshold: 0.75,
      stringArrayWrappersCount: 1,
      simplify: true
    },
    standard: {
      ...baseOptions,
      controlFlowFlattening: true,
      controlFlowFlatteningThreshold: 0.75,
      debugProtection: true,
      stringArrayEncoding: ['base64'],
      stringArrayThreshold: 0.5,
      stringArrayWrappersCount: 1,
      stringArrayWrappersChainedCalls: true,
      simplify: true
    },
    advanced: {
      ...baseOptions,
      controlFlowFlattening: true,
      controlFlowFlatteningThreshold: 0.85,
      deadCodeInjection: true,
      deadCodeInjectionThreshold: 0.3,
      debugProtection: true,
      debugProtectionInterval: 1000,
      disableConsoleOutput: true,
      selfDefending: true,
      stringArrayEncoding: ['rc4'],
      stringArrayThreshold: 0.4,
      stringArrayWrappersCount: 2,
      stringArrayWrappersChainedCalls: true,
      transformObjectKeys: true,
      unicodeEscapeSequence: true,
      simplify: false
    },
    enterprise: {
      ...baseOptions,
      compact: false,
      controlFlowFlattening: true,
      controlFlowFlatteningThreshold: 1,
      deadCodeInjection: true,
      deadCodeInjectionThreshold: 0.5,
      debugProtection: true,
      debugProtectionInterval: 500,
      disableConsoleOutput: true,
      domainLock: domainLockArray.length > 0 ? domainLockArray : undefined,
      identifierNamesGenerator: 'mangled',
      numbersToExpressions: true,
      renameGlobals: true,
      renameProperties: true,
      renamePropertiesMode: 'safe',
      selfDefending: true,
      splitStrings: true,
      splitStringsChunkLength: 8,
      stringArray: true,
      stringArrayEncoding: ['rc4', 'base64'],
      stringArrayIndexShift: true,
      stringArrayThreshold: 0.3,
      stringArrayWrappersCount: 3,
      stringArrayWrappersChainedCalls: true,
      transformObjectKeys: true,
      unicodeEscapeSequence: true,
      simplify: false
    },
    ultra: {
      ...baseOptions,
      compact: false,
      controlFlowFlattening: true,
      controlFlowFlatteningThreshold: 1,
      deadCodeInjection: true,
      deadCodeInjectionThreshold: 0.75,
      debugProtection: true,
      debugProtectionInterval: 200,
      disableConsoleOutput: true,
      domainLock: domainLockArray.length > 0 ? domainLockArray : undefined,
      domainLockRedirectUrl: 'about:blank',
      identifierNamesGenerator: 'mangled-shuffled',
      numbersToExpressions: true,
      renameGlobals: true,
      renameProperties: true,
      renamePropertiesMode: 'unsafe',
      reservedNames: ['^_$'],
      selfDefending: true,
      simplify: false,
      splitStrings: true,
      splitStringsChunkLength: 5,
      stringArray: true,
      stringArrayEncoding: ['rc4', 'base64', 'none'],
      stringArrayIndexShift: true,
      stringArrayThreshold: 0.1,
      stringArrayWrappersCount: 5,
      stringArrayWrappersChainedCalls: true,
      stringArrayWrappersParametersMaxCount: 5,
      transformObjectKeys: true,
      unicodeEscapeSequence: true,
      rotateStringArray: true,
      shuffleStringArray: true,
      seed: Math.random().toString(36).substring(2, 15),
      forceTransformStrings: ['eval', 'Function', 'constructor', '^get', '^set'],
      reservedStrings: ['^some.*']
    }
  };

  return optionsByLevel[currentSecurityLevel];
}

// UI Functions
function showError(message) {
  const errorElement = document.getElementById("errorAlert") || createErrorElement();
  errorElement.innerHTML = `
    <div class="d-flex align-items-center">
      <i class="fas fa-exclamation-circle me-2"></i>
      <span>${message}</span>
    </div>
  `;
  errorElement.classList.remove("d-none");
  setTimeout(() => errorElement.classList.add("d-none"), 5000);
}

function createErrorElement() {
  const errorElement = document.createElement("div");
  errorElement.id = "errorAlert";
  errorElement.className = "alert alert-danger d-none position-fixed top-0 start-50 translate-middle-x mt-3";
  errorElement.style.zIndex = "1000";
  document.body.appendChild(errorElement);
  return errorElement;
}

// Copy to clipboard with improved feedback
copyBtn.onclick = async function() {
  try {
    await navigator.clipboard.writeText(output.value);
    showToast("Code copied to clipboard!");
  } catch (error) {
    showError("Failed to copy: " + error.message);
  }
};

// Download functionality
downloadBtn.onclick = function() {
  const blob = new Blob([output.value], { type: "text/javascript" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `obfuscated-${currentSecurityLevel}-${Date.now()}.js`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast("Download started!");
};

function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast show";
  toast.setAttribute("role", "alert");
  toast.innerHTML = `
    <div class="toast-body d-flex align-items-center">
      <i class="fas fa-check-circle text-success me-2"></i>
      <span>${message}</span>
      <button type="button" class="btn-close ms-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
  `;
  document.body.appendChild(toast);
  
  // Add Bootstrap toast functionality
  const bsToast = new bootstrap.Toast(toast, {
    autohide: true,
    delay: 3000
  });
  bsToast.show();
  
  toast.addEventListener("hidden.bs.toast", () => {
    toast.remove();
  });
}

// Reset form
obfuscateAnotherCode.onclick = function() {
  form2.classList.add("d-none");
  form.classList.remove("d-none");
  output.value = "";
  javascriptCode.focus();
};

// Analytics (optional)
function logObfuscationEvent(level, domainCount) {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'obfuscation', {
      'security_level': level,
      'domain_locks': domainCount
    });
  }
  
  // Simple console log for debugging
  console.log(`Obfuscation completed at ${level} level with ${domainCount} domain locks`);
}

// Initialize
updateSecurityDescription();
updatePerformanceMeter();

// Add performance warning for ultra level
document.querySelector('[data-level="ultra"]').addEventListener('click', () => {
  showToast("Warning: Ultra level may significantly impact performance");
});
