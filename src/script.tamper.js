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

// Do nothing until the "branch selection" control appears
waitForKeyElements(".new-discussion-timeline .range-editor", main);

/**
 * Put a PR template picker on the current GitHub compare page
 */
async function main() {
  "use strict";

  // Return early if script has already run
  if (document.body.dataset.gprp) return;
  document.body.setAttribute("data-gprp", true);

  // Return early if we're not currently on a compare page
  if (!window.location.href.match("https://github.com/*/*/compare/*")) {
    return;
  }

  // Find selection control
  const brancher = document.querySelector(
    ".new-discussion-timeline .range-editor"
  );

  // Build the picker
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

  // TODO: do I need to await here?
  const names = ["", ...(await templates())];
  for (templateName of names) {
    const option = document.createElement("option");
    option.value = templateName;
    option.text = templateName;
    picker.appendChild(option);
  }

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
    .then((results) =>
      results
        .map((el) => el.name)
        .filter((el) => el.endsWith(".md") && el !== "README.md")
    )
    .catch((error) => {
      console.log(`can't fetch PR templates: ${error}`);
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
