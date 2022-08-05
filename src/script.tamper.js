// ==UserScript==
// @name         GitHub PR Template Picker
// @namespace    clarknet.info
// @version      0.1.0
// @description  Allows picking a changing the template for a PR in GitHub
// @author       @bclarkx2
// @match        https://github.com/*/*/compare/*
// @match        https://github.com/*
// @require      http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// ==/UserScript==

// Milliseconds to wait between page URL checks
const URL_CHECK_DELAY = 111;

// It has begun!
console.log("Loaded GitHub PR Template Picker");

// Poll for URL changes, both on initial page load and when it gets changed via
// AJAX. Fortunately, GitHub always updates the URL when we move to and between
// compare views.
setInterval(function () {
  if (
    this.lastPathStr !== location.pathname ||
    this.lastQueryStr !== location.search
  ) {
    this.lastPathStr = location.pathname;
    this.lastQueryStr = location.search;

    // Double check that we're on a compare page. We need to run the user script
    // on _all_ GH domain pages because GH uses AJAX to move between pages without
    // triggering a page load, but one ramification is that there's a slim possibility
    // that the waitForKeyElements would match on a control that's not actually on the
    // compare page. If so, don't start looking for the branch selection control.
    if (!window.location.href.match("https://github.com/.*/.*/compare/.*")) {
      return;
    }

    // Once we're on the right page, do nothing until the "branch selection" control
    // appears. This feature requires loading jQuery via the @require tag above.
    // Set bWaitOnce=true to stop scanning for new matches once asuccessful match
    // is made.
    waitForKeyElements(
      ".new-discussion-timeline .range-editor:not(#prTemplateHolder)",
      main,
      true
    );
  }
}, URL_CHECK_DELAY);

/**
 * Put a PR template picker on the current GitHub compare page.
 */
function main(brancherNode) {
  "use strict";

  console.log(`matched`);
  const brancher = brancherNode[0];

  // DON'T await here -- we need to return immediately to stop the scanning, while
  // asynchronously building the picker and adding it to the DOM.
  addPicker(brancher);

  // Return false to tell waitForKeyElements we're all good and can stop scanning
  // for matches.
  return false;
}

/**
 * Add a PR template picker holder after the specified branch selector control
 * @param {HTMLElement} brancher - the branch selector control after which to place the picker
 */
async function addPicker(brancher) {
  // Wait for picker to be built from API call
  const holder = await picker();

  // Add holder after brancher
  brancher.parentNode.insertBefore(holder, brancher.nextSibling);
}

/**
 * Build a PR template picker holder
 * @returns {HTMLElement}
 */
async function picker() {
  // Create new template picker container
  const holder = document.createElement("div");
  holder.id = "prTemplateHolder";
  holder.classList.add("range-editor");
  holder.classList.add("color-fg-muted");
  holder.classList.add("js-range-editor");

  // Create the label
  const label = document.createElement("label");
  label.textContent = "PR Template: ";
  holder.appendChild(label);

  // Create the picker
  const picker = document.createElement("select");
  picker.id = "prTemplatePicker";

  // Fill out available template options
  const names = ["", ...(await templates())];
  for (const templateName of names) {
    const option = document.createElement("option");
    option.value = templateName;
    option.text = templateName;
    picker.appendChild(option);
  }

  // Default picker to what's currently in the URL bar
  // May not correspond to _actual_ template being used,
  // because the repo's default template doesn't actually
  // show up in the URL. That's fine, though.
  picker.value = currentTemplate();

  // Attach handler to picker
  picker.addEventListener("change", handleSelect, true);

  // Add the picker to the holder
  holder.appendChild(picker);

  return holder;
}

/**
 * Return the set of available template names
 * @returns {Promise}
 */
async function templates() {
  return fetch(
    "https://api.github.com/repos/nicheinc/.github/contents/.github/PULL_REQUEST_TEMPLATE"
  )
    .then((response) => {
      if (!response.ok) {
        throw Error(response.statusText);
      }
      return response;
    })
    .then((response) => response.json())
    .then((results) => {
      return results
        .map((el) => el.name)
        .filter((el) => el.endsWith(".md") && el !== "README.md");
    })
    .catch((error) => {
      return [];
    });
}

/**
 * Handle a change event from the template picker.
 * @param {Event} e - from a select control
 */
function handleSelect(e) {
  e.preventDefault();
  e.stopPropagation();
  const template = e.currentTarget.value;
  setTemplate(template);
}

/**
 * Set the template parameter in the current page URL
 * @param {string} template - the name of the template file ('' to remove)
 */
function setTemplate(template) {
  const urlParams = new URLSearchParams(window.location.search);

  if (template === "") {
    urlParams.delete("template");
  } else {
    urlParams.set("template", template);
    urlParams.set("quick_pull", "1");
  }

  window.location.search = urlParams;
}

/**
 * Return the current template URL parameter
 * @returns {string}
 */
function currentTemplate() {
  const params = new URLSearchParams(window.location.search);
  return params.get("template");
}
