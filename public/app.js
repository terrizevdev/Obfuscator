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
const securityDescription = document.getElementById("securityDescription");

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
    
    // Special warning for ultra level
    if (currentSecurityLevel === "ultra") {
      showToast("⚠️ Ultra level may significantly impact performance and code size");
    }
  });
});

// Security level descriptions and performance indicators
function updateSecurityDescription() {
  const descriptions = {
    basic: {
      text: "Basic: Minimal protection (fastest execution)",
      performance: 95
    },
    standard: {
      text: "Standard: Balanced protection (recommended)",
      performance: 80
    },
    advanced: {
      text: "Advanced: Strong protection (moderate impact)",
      performance: 65
    },
    enterprise: {
      text: "Enterprise: Maximum protection (high impact)",
      performance: 45
    },
    ultra: {
      text: "ULTRA: Extreme protection (heavy impact)",
      performance: 20
    }
  };
  
  securityDescription.textContent = descriptions[currentSecurityLevel].text;
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
  performanceMeterFill.className = `performance-meter-fill ${
    percentage > 70 ? "bg-success" : 
    percentage > 40 ? "bg-warning" : "bg-danger"
  }`;
}

// Domain validation helper
function validateDomains(domainString) {
  if (!domainString.trim()) return [];
  
  const domains = domainString.split(",")
    .map(domain => domain.trim())
    .filter(domain => domain.length > 0);
  
  // Validate each domain format
  const domainRegex = /^(?!:\/\/)([a-z0-9-]+\.)*[a-z0-9-]+\.[a-z]{2,}$/i;
  domains.forEach(domain => {
    if (!domainRegex.test(domain)) {
      throw new Error(`Invalid domain format: ${domain}. Use format like 'example.com'`);
    }
  });

  // Check for duplicates
  const uniqueDomains = [...new Set(domains)];
  if (uniqueDomains.length !== domains.length) {
    throw new Error("Duplicate domains found in Domain Lock");
  }

  return domains;
}

// Main obfuscation function
form.onsubmit = async function(event) {
  event.preventDefault();
  
  try {
    // Validate inputs
    if (!javascriptCode.value.trim()) {
      throw new Error("Please enter JavaScript code to obfuscate");
    }

    const domains = validateDomains(lockDomains.value);

    // Show loading state
    const submitBtn = this.querySelector("button[type='submit']");
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Processing...';
    submitBtn.disabled = true;

    // Prepare options
    const obfuscationOptions = {
      code: javascriptCode.value,
      securityLevel: currentSecurityLevel,
      domainLock: domains
    };

    // Send to server for obfuscation
    const response = await fetch("/api/obfuscate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(obfuscationOptions)
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || "Obfuscation failed");
    }

    // Display results
    lastObfuscatedCode = result.obfuscatedCode;
    output.value = lastObfuscatedCode;

    // Switch to results view
    form2.classList.remove("d-none");
    this.classList.add("d-none");

    showToast(`✅ Obfuscation successful (${currentSecurityLevel.toUpperCase()} level)`);

  } catch (error) {
    showError(error.message);
  } finally {
    // Reset button state
    const submitBtn = form.querySelector("button[type='submit']");
    if (submitBtn) {
      submitBtn.innerHTML = '<i class="fas fa-lock me-2"></i>Obfuscate Code';
      submitBtn.disabled = false;
    }
  }
};

// Copy to clipboard
copyBtn.onclick = async function() {
  try {
    await navigator.clipboard.writeText(output.value);
    showToast("📋 Code copied to clipboard!");
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
  showToast("💾 Download started!");
};

// Reset form
obfuscateAnotherCode.onclick = function() {
  form2.classList.add("d-none");
  form.classList.remove("d-none");
  output.value = "";
  javascriptCode.focus();
};

// UI Feedback Functions
function showError(message) {
  const toast = createToast(message, "fas fa-exclamation-circle text-danger");
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 5000);
}

function showToast(message) {
  const toast = createToast(message, "fas fa-check-circle text-success");
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function createToast(message, iconClass) {
  const toast = document.createElement("div");
  toast.className = "toast show align-items-center";
  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">
        <i class="${iconClass} me-2"></i>
        ${message}
      </div>
      <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast"></button>
    </div>
  `;
  toast.style.position = "fixed";
  toast.style.bottom = "20px";
  toast.style.right = "20px";
  toast.style.zIndex = "1100";
  return toast;
}

// Initialize
updateSecurityDescription();
updatePerformanceMeter();

// Set default security level to active
document.querySelector(`[data-level="${currentSecurityLevel}"]`).classList.add("active");
