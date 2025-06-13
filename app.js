let form = document.getElementById("form");
let form2 = document.getElementById("form2");
let javascriptCode = document.getElementById("javascriptCode");
let lockDomains = document.getElementById("lockDomains");
let output = document.getElementById("output");
let obfuscateAnotherCode = document.getElementById("obfuscateAnotherCode");
let copyBtn = document.getElementById("copyBtn");
let securityLevelButtons = document.querySelectorAll(".security-level-btn");

let currentSecurityLevel = "medium"; // Default to Standard

// Set up security level buttons
securityLevelButtons.forEach(button => {
  button.addEventListener("click", function() {
    securityLevelButtons.forEach(btn => btn.classList.remove("active"));
    this.classList.add("active");
    currentSecurityLevel = this.dataset.level;
  });
});

form.onsubmit = function (event) {
  event.preventDefault();

  let domainLockArray = lockDomains.value.split(",").map(domain => domain.trim()).filter(domain => domain);

  // Configure obfuscation options based on security level
  let obfuscationOptions = {
    domainLock: domainLockArray.length > 0 ? domainLockArray : undefined,
    compact: true,
    controlFlowFlattening: false,
    deadCodeInjection: false,
    debugProtection: false,
    debugProtectionInterval: 0,
    disableConsoleOutput: false,
    identifierNamesGenerator: 'hexadecimal',
    log: false,
    numbersToExpressions: false,
    renameGlobals: false,
    selfDefending: false,
    simplify: true,
    splitStrings: false,
    stringArray: true,
    stringArrayEncoding: [],
    stringArrayIndexShift: true,
    stringArrayWrappersCount: 1,
    stringArrayWrappersChainedCalls: true,
    stringArrayWrappersParametersMaxCount: 2,
    stringArrayWrappersType: 'variable',
    stringArrayThreshold: 0.75,
    unicodeEscapeSequence: false
  };

  // Adjust options based on security level
  switch(currentSecurityLevel) {
    case "low":
      // Basic obfuscation
      obfuscationOptions.controlFlowFlattening = false;
      obfuscationOptions.stringArray = true;
      obfuscationOptions.stringArrayThreshold = 0.75;
      break;
    case "medium":
      // Standard obfuscation
      obfuscationOptions.controlFlowFlattening = true;
      obfuscationOptions.controlFlowFlatteningThreshold = 0.75;
      obfuscationOptions.stringArray = true;
      obfuscationOptions.stringArrayThreshold = 0.5;
      obfuscationOptions.stringArrayEncoding = ['base64'];
      obfuscationOptions.debugProtection = true;
      break;
    case "high":
      // Advanced obfuscation
      obfuscationOptions.controlFlowFlattening = true;
      obfuscationOptions.controlFlowFlatteningThreshold = 1;
      obfuscationOptions.deadCodeInjection = true;
      obfuscationOptions.deadCodeInjectionThreshold = 0.4;
      obfuscationOptions.debugProtection = true;
      obfuscationOptions.debugProtectionInterval = true;
      obfuscationOptions.disableConsoleOutput = true;
      obfuscationOptions.stringArray = true;
      obfuscationOptions.stringArrayEncoding = ['rc4'];
      obfuscationOptions.stringArrayThreshold = 0.25;
      obfuscationOptions.unicodeEscapeSequence = true;
      obfuscationOptions.selfDefending = true;
      break;
  }

  try {
    var obfuscationResult = JavaScriptObfuscator.obfuscate(javascriptCode.value, obfuscationOptions);
    output.value = obfuscationResult.getObfuscatedCode();
    form2.classList.remove("d-none");
    this.classList.add("d-none");
  } catch (error) {
    alert("Error during obfuscation: " + error.message);
  }
};

obfuscateAnotherCode.onclick = function () {
  form2.classList.add("d-none");
  form.classList.remove("d-none");
  output.value = "";
};

copyBtn.onclick = function () {
  navigator.clipboard.writeText(output.value).then(() => {
    // Create and show a temporary tooltip
    const tooltip = document.createElement("div");
    tooltip.textContent = "Copied!";
    tooltip.style.position = "fixed";
    tooltip.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
    tooltip.style.color = "white";
    tooltip.style.padding = "5px 10px";
    tooltip.style.borderRadius = "4px";
    tooltip.style.zIndex = "10000";
    tooltip.style.top = (event.clientY - 40) + "px";
    tooltip.style.left = (event.clientX - 20) + "px";
    
    document.body.appendChild(tooltip);
    
    setTimeout(() => {
      document.body.removeChild(tooltip);
    }, 1000);
  }).catch(err => {
    console.error("Failed to copy: ", err);
  });
};