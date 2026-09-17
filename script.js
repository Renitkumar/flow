/* FLOW — COMPLETE JAVASCRIPT */

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("explorePropertyList")) initExplore();

  if (document.getElementById("propertyList")) initHome();

  if (
    document.querySelector(".property-form") &&
    document.getElementById("continueProperty")
  ) {
    initPostChoice();
  }

  if (document.getElementById("detailsContinue")) {
    initDetailsPage();
  }

  if (document.getElementById("publishProperty")) {
    initMediaPage();
  }

  if (
    document.body.classList.contains("property-view-page")
  ) {
    initPropertyView();
  }

  document
    .getElementById("notificationBtn")
    ?.addEventListener("click", () => {
      alert("No new notifications.");
    });

  document
    .getElementById("seeAllProperties")
    ?.addEventListener("click", () => {
      document.getElementById("seeAll")?.click();
    });
});


/* =========================================================
   HELPERS
========================================================= */

const demoLocations = [
  "Nokha, Bikaner",
  "Bikaner, Rajasthan",
  "Jaipur, Rajasthan",
  "Jodhpur, Rajasthan",
  "Kota, Rajasthan",
  "Udaipur, Rajasthan",
  "Ajmer, Rajasthan",
  "Sri Ganganagar, Rajasthan",
  "Delhi, India",
  "Mumbai, Maharashtra",
  "Pune, Maharashtra",
  "Ahmedabad, Gujarat",
  "Surat, Gujarat",
  "Indore, Madhya Pradesh",
  "Chandigarh, India",
  "Lucknow, Uttar Pradesh",
  "Kolkata, West Bengal",
  "Bengaluru, Karnataka",
  "Hyderabad, Telangana",
  "Chennai, Tamil Nadu"
];


function shortLocation(value = "") {
  return String(value)
    .split(",")[0]
    .trim();
}


function normalize(value = "") {
  return shortLocation(value)
    .toLowerCase()
    .trim();
}


function escapeHtml(value = "") {
  return String(value).replace(
    /[&<>"']/g,
    character => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    })[character]
  );
}


function iconFor(type) {
  return {
    house: "🏠",
    flat: "🏢",
    room: "🛏️",
    shop: "🏪",
    commercial: "🏬",
    plot: "📐",
    other: "🏗️"
  }[type] || "🏠";
}


function readFile(file) {
  return new Promise((resolve, reject) => {

    if (!file || !file.type?.startsWith("image/")) {
      reject(new Error("Invalid image file"));
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {

      const image = new Image();

      image.onload = () => {

        const MAX_SIZE = 1280;
        const scale = Math.min(1, MAX_SIZE / Math.max(image.width, image.height));

        const width = Math.max(1, Math.round(image.width * scale));
        const height = Math.max(1, Math.round(image.height * scale));

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d", { alpha: false });

        if (!ctx) {
          resolve(reader.result);
          return;
        }

        ctx.drawImage(image, 0, 0, width, height);

        // JPEG compression keeps localStorage usage small enough for property photos.
        const compressed = canvas.toDataURL("image/jpeg", 0.68);

        resolve(compressed);
      };

      image.onerror = () => resolve(reader.result);
      image.src = reader.result;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}


/* =========================================================
   HOMEPAGE
========================================================= */

function initHome() {

  const locationBtn =
    document.getElementById("locationBtn");

  const overlay =
    document.getElementById("locationOverlay");

  const close =
    document.getElementById("closeLocation");

  const input =
    document.getElementById("locationSearch");

  const list =
    document.getElementById("locationsList");

  const selected =
    document.getElementById("selectedLocation");

  const heading =
    document.getElementById("propertyHeading");

  const search =
    document.getElementById("propertySearch");

  const noResults =
    document.getElementById("noResults");


  let currentLocation =
    localStorage.getItem("flowLocation") ||
    "Nokha";

  let currentCategory =
    "all";

  let currentType =
    "all";


  if (selected) {
    selected.textContent =
      shortLocation(currentLocation);
  }


  if (heading) {
    heading.textContent =
      "Properties in " +
      shortLocation(currentLocation);
  }


  /* =======================================================
     LOCATION LIST
  ======================================================= */

  function renderLocations(items) {

    if (!list) return;

    if (!items.length) {

      list.innerHTML = `
        <div class="empty-location">
          <div>📍</div>
          <p>No location found</p>
          <small>Try another city or area</small>
        </div>
      `;

      return;
    }


    list.innerHTML =
      items
        .map(location => `
          <button
            type="button"
            data-location="${escapeHtml(location)}"
          >
            📍 ${escapeHtml(location)}
          </button>
        `)
        .join("");

  }


  renderLocations(
    demoLocations
  );


  /* =======================================================
     FILTER
  ======================================================= */

  function filter() {

    const query =
      search?.value
        .trim()
        .toLowerCase() || "";

    let count = 0;


    document
      .querySelectorAll(".property-card")
      .forEach(card => {

        const location =
          card.dataset.location || "";

        const category =
          card.dataset.category || "";

        const type =
          card.dataset.type || "";

        const text =
          card.textContent.toLowerCase();


        const locationMatch =
          normalize(location) ===
          normalize(currentLocation);


        const categoryMatch =
          currentCategory === "all" ||
          category === currentCategory;


        const typeMatch =
          currentType === "all" ||
          type === currentType;


        const searchMatch =
          !query ||
          text.includes(query);


        const show =
          locationMatch &&
          categoryMatch &&
          typeMatch &&
          searchMatch;


        card.style.display =
          show ? "" : "none";


        if (show) {
          count++;
        }

      });


    if (noResults) {

      noResults.style.display =
        count
          ? "none"
          : "block";

    }

  }


  /* =======================================================
     SAVE BUTTONS
  ======================================================= */

  function attachSaveButtons() {

    document
      .querySelectorAll(".save-btn")
      .forEach(button => {

        if (button.dataset.bound === "true") {
          return;
        }

        button.dataset.bound = "true";

        const card = button.closest(".property-card");
        const propertyId = card?.dataset?.id;

        if (propertyId && typeof isPropertySaved === "function") {
          const saved = isPropertySaved(propertyId);
          button.textContent = saved ? "♥" : "♡";
          button.classList.toggle("saved", saved);
        }

        button.addEventListener("click", event => {

          event.preventDefault();
          event.stopPropagation();

          if (propertyId && typeof toggleSavedProperty === "function") {

            const saved = toggleSavedProperty(propertyId);

            button.textContent = saved ? "♥" : "♡";
            button.classList.toggle("saved", saved);

          } else {

            button.textContent =
              button.textContent.trim() === "♥" ? "♡" : "♥";

          }

        });

      });

  }

  /* =======================================================
     RENDER USER POSTED PROPERTIES
  ======================================================= */

  function renderSavedProperties() {

    let saved = [];


    try {

      saved =
        JSON.parse(
          localStorage.getItem(
            "flowProperties"
          ) || "[]"
        );


      if (
        !Array.isArray(saved)
      ) {
        saved = [];
      }

    } catch {

      saved = [];

    }


    const grid =
      document.getElementById(
        "propertyList"
      );


    if (!grid) {
      return;
    }


    saved
      .filter(property => property?.status !== "sold_out")
      .forEach(property => {

      const card =
        document.createElement(
          "article"
        );


      card.className =
        "property-card";


      /*
        VERY IMPORTANT

        This ID identifies a real
        user-posted property.

        Demo/static cards will NOT
        have this ID.
      */

      card.dataset.id =
        property.id;


      card.dataset.location =
        property.location || "";


      card.dataset.category =
        property.propertyType ||
        "other";


      card.dataset.type =
        property.listingType ||
        "rent";


      const photo =
        property.photos?.[0];


      const photoHtml =
        photo

          ? `
            <img
              class="property-card-image"
              src="${escapeHtml(photo)}"
              alt="${escapeHtml(
                property.title ||
                "Property"
              )}"
            >
          `

          : `
            <div class="property-card-placeholder">
              ${iconFor(
                property.propertyType
              )}
            </div>
          `;


      const badgeText =
        property.listingType ===
        "sell"

          ? "FOR SALE"

          : "FOR RENT";


      const badgeClass =
        property.listingType ===
        "sell"

          ? "badge sale"

          : "badge";


      const extraInfo =
        property.area ||
        property.bedrooms ||
        property.propertyType ||
        "";


      card.innerHTML = `

        <div class="property-photo">

          ${photoHtml}

          <span class="${badgeClass}">
            ${badgeText}
          </span>

          <button
            type="button"
            class="save-btn"
            aria-label="Save property"
          >
            ♡
          </button>

        </div>


        <div class="property-details">

          <h3>
            ${escapeHtml(
              property.title ||
              "Property"
            )}
          </h3>


          <p class="property-location">
            📍 ${escapeHtml(
              property.location ||
              ""
            )}
          </p>


          <div class="property-info-row">

            <strong>
              ${escapeHtml(
                property.price ||
                ""
              )}
            </strong>

            <span>
              ${escapeHtml(
                extraInfo
              )}
            </span>

          </div>

        </div>

      `;


      /* ===================================================
         IMAGE ERROR
      =================================================== */

      const image =
        card.querySelector(
          ".property-card-image"
        );


      if (image) {

        image.onerror = () => {

          image.style.display =
            "none";


          const placeholder =
            document.createElement(
              "div"
            );


          placeholder.className =
            "property-card-placeholder";


          placeholder.textContent =
            iconFor(
              property.propertyType
            );


          image.parentElement.prepend(
            placeholder
          );

        };

      }


      grid.prepend(card);


      /* ===================================================
         USER PROPERTY CLICK

         THIS IS THE IMPORTANT PART.

         We DO NOT create another
         global handler for this.
      =================================================== */

      card.addEventListener(
        "click",
        event => {

          if (
            event.target.closest(
              ".save-btn"
            )
          ) {
            return;
          }


          try {
           localStorage.setItem(
  "flowSelectedProperty",
  String(property.id)
);  

          } catch (error) {

            console.error(
              "Unable to save selected property:",
              error
            );


            alert(
              "Unable to open this property. Please remove some old photos/properties from browser storage."
            );


            return;
          }


          window.location.href =
            "property-view.html";

        }
      );

    });


    attachSaveButtons();

  }


  renderSavedProperties();


  /* =======================================================
     LOCATION OPEN
  ======================================================= */

  locationBtn?.addEventListener(
    "click",
    () => {

      if (!overlay) {
        return;
      }


      overlay.classList.add(
        "show"
      );


      if (input) {
        input.value = "";
      }


      renderLocations(
        demoLocations
      );


      setTimeout(() => {

        input?.focus();

      }, 50);

    }
  );


  /* =======================================================
     LOCATION CLOSE
  ======================================================= */

  close?.addEventListener(
    "click",
    () => {

      overlay?.classList.remove(
        "show"
      );

    }
  );


  overlay?.addEventListener(
    "click",
    event => {

      if (
        event.target ===
        overlay
      ) {

        overlay.classList.remove(
          "show"
        );

      }

    }
  );


  /* =======================================================
     LOCATION SEARCH
  ======================================================= */

  input?.addEventListener(
    "input",
    () => {

      const query =
        input.value
          .trim()
          .toLowerCase();


      const filtered =
        query

          ? demoLocations.filter(
              location =>
                location
                  .toLowerCase()
                  .includes(query)
            )

          : demoLocations;


      renderLocations(
        filtered
      );

    }
  );


  /* =======================================================
     LOCATION SELECT
  ======================================================= */

  list?.addEventListener(
    "click",
    event => {

      const button =
        event.target.closest(
          "button[data-location]"
        );


      if (!button) {
        return;
      }


      currentLocation =
        button.dataset.location;


      localStorage.setItem(
        "flowLocation",
        currentLocation
      );


      if (selected) {

        selected.textContent =
          shortLocation(
            currentLocation
          );

      }


      if (heading) {

        heading.textContent =
          "Properties in " +
          shortLocation(
            currentLocation
          );

      }


      overlay?.classList.remove(
        "show"
      );


      filter();

    }
  );


  /* =======================================================
     RENT / SELL FILTER
  ======================================================= */

  document
    .querySelectorAll(
      ".listing-tab"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          document
            .querySelectorAll(
              ".listing-tab"
            )
            .forEach(item =>
              item.classList.remove(
                "active"
              )
            );


          button.classList.add(
            "active"
          );


          currentType =
            button.dataset.type ||
            "all";


          filter();

        }
      );

    });


  /* =======================================================
     CATEGORY FILTER
  ======================================================= */

  document
    .querySelectorAll(
      ".category"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          document
            .querySelectorAll(
              ".category"
            )
            .forEach(item =>
              item.classList.remove(
                "active"
              )
            );


          button.classList.add(
            "active"
          );


          currentCategory =
            button.dataset.category ||
            "all";


          filter();

        }
      );

    });


  /* =======================================================
     SEARCH
  ======================================================= */

  search?.addEventListener(
    "input",
    filter
  );


  /* =======================================================
     SEE ALL
  ======================================================= */

  document
    .getElementById("seeAll")
    ?.addEventListener(
      "click",
      event => {

        event.preventDefault();


        currentCategory =
          "all";


        document
          .querySelectorAll(
            ".category"
          )
          .forEach(item =>
            item.classList.remove(
              "active"
            )
          );


        document
          .querySelector(
            '.category[data-category="all"]'
          )
          ?.classList.add(
            "active"
          );


        filter();

      }
    );


  filter();

}


/* =========================================================
   POST PROPERTY — STEP 1
========================================================= */

function initPostChoice() {

  let listingType =
    null;

  let propertyType =
    null;


  const choiceCards =
    document.querySelectorAll(
      ".choice-card"
    );


  const propertyCards =
    document.querySelectorAll(
      ".property-type"
    );


  const continueBtn =
    document.getElementById(
      "continueProperty"
    );


  const message =
    document.getElementById(
      "continueMessage"
    );


  if (!continueBtn) {
    return;
  }


  choiceCards.forEach(
    card => {

      card.addEventListener(
        "click",
        () => {

          choiceCards.forEach(
            item =>
              item.classList.remove(
                "active"
              )
          );


          card.classList.add(
            "active"
          );


          listingType =
            card.dataset.listing;


          update();

        }
      );

    }
  );


  propertyCards.forEach(
    card => {

      card.addEventListener(
        "click",
        () => {

          propertyCards.forEach(
            item =>
              item.classList.remove(
                "active"
              )
          );


          card.classList.add(
            "active"
          );


          propertyType =
            card.dataset.property;


          update();

        }
      );

    }
  );


  function update() {

    const ready =
      Boolean(
        listingType &&
        propertyType
      );


    continueBtn.disabled =
      !ready;


    if (message) {

      message.textContent =
        ready

          ? "Both selections are ready. Continue to add details."

          : "Select one option from Step 1 and Step 2";

    }

  }


  continueBtn.addEventListener(
    "click",
    () => {

      if (
        continueBtn.disabled
      ) {
        return;
      }


      localStorage.setItem(
        "flowPropertySetup",
        JSON.stringify({
          listingType,
          propertyType
        })
      );


      window.location.href =
        "property-details.html";

    }
  );

}


/* =========================================================
   PROPERTY DETAILS PAGE
========================================================= */

function initDetailsPage() {

  let setup = null;

  try {
    setup = JSON.parse(
      localStorage.getItem("flowPropertySetup") || "null"
    );
  } catch {
    setup = null;
  }

  if (!setup?.listingType || !setup?.propertyType) {
    window.location.href = "post-property.html";
    return;
  }

  const pretty = {
    house: "Home",
    flat: "Flat",
    room: "Room",
    shop: "Shop",
    commercial: "Commercial",
    plot: "Plot",
    other: "Other"
  };

  const detailsMode = document.getElementById("detailsMode");
  const detailsTitle = document.getElementById("detailsTitle");
  const selectionSummary = document.getElementById("selectionSummary");
  const formGrid = document.getElementById("dynamicDetailsFields");

  if (detailsMode) {
    detailsMode.textContent =
      setup.listingType === "rent" ? "LIST FOR RENT" : "LIST FOR SALE";
  }

  if (detailsTitle) {
    detailsTitle.textContent =
      `${pretty[setup.propertyType] || "Property"} details`;
  }

  if (selectionSummary) {
    selectionSummary.innerHTML = `
      <span class="summary-pill">
        ${setup.listingType === "rent" ? "🏠 Rent" : "💰 Sell"}
      </span>
      <span class="summary-pill">
        ${iconFor(setup.propertyType)}
        ${pretty[setup.propertyType] || setup.propertyType}
      </span>
    `;
  }

  const isRent = setup.listingType === "rent";
  const type = setup.propertyType;

  const field = (id, label, type = "text", extra = "") => `
    <div class="input-group" id="${id}Group">
      <label for="${id}">${label}</label>
      <input id="${id}" type="${type}" ${extra}>
    </div>
  `;

  const selectField = (id, label, options) => `
    <div class="input-group" id="${id}Group">
      <label for="${id}">${label}</label>
      <select id="${id}">
        <option value="">Select</option>
        ${options.map(o => `<option value="${o.value}">${o.label}</option>`).join("")}
      </select>
    </div>
  `;

  const priceField = `
    <div class="input-group" id="priceGroup">
      <label for="propertyPrice">${isRent ? "Property Price" : "Total Amount"}</label>
      <div class="details-price-wrap">
        <input id="propertyPrice" type="number" min="0" inputmode="numeric" placeholder="${isRent ? "Enter monthly rent" : "Enter total amount"}">
        ${isRent ? '<span class="details-price-suffix">/month</span>' : ""}
      </div>
    </div>
  `;

  const descriptionField = `
    <div class="input-group full" id="descriptionGroup">
      <label for="description">Description</label>
      <textarea id="description" placeholder="Describe the property..."></textarea>
    </div>
  `;

  if (formGrid) {
    let html = "";

    if (type === "house") {
      html = `
        ${field("propertyTitle", "Title", "text", 'placeholder="Enter property title"')}
        ${priceField}
        ${field("ownerContact", "Contact Number", "tel", 'inputmode="numeric" maxlength="10" placeholder="10-digit mobile number"')}
        ${field("propertyArea", "Size", "text", 'placeholder="e.g. 1200 sq.ft"')}
        ${selectField("bedrooms", "Bedroom", [
          {value:"1",label:"1"}, {value:"2",label:"2"}, {value:"3",label:"3"},
          {value:"4",label:"4"}, {value:"5+",label:"5+"}
        ])}
        ${selectField("bathrooms", "Bathroom", [
          {value:"1",label:"1"}, {value:"2",label:"2"}, {value:"3",label:"3"},
          {value:"4+",label:"4+"}
        ])}
        ${selectField("kitchen", "Kitchen", [
          {value:"Yes",label:"Yes"}, {value:"No",label:"No"}
        ])}
        ${selectField("parking", "Parking", [
          {value:"Yes",label:"Yes"}, {value:"No",label:"No"}
        ])}
        ${descriptionField}
      `;
    } else if (type === "flat") {
      html = `
        ${field("propertyTitle", "Title", "text", 'placeholder="Enter flat title"')}
        ${priceField}
        ${field("propertyArea", "Size", "text", 'placeholder="e.g. 1200 sq.ft"')}
        ${field("ownerContact", "Contact Details", "tel", 'inputmode="numeric" maxlength="10" placeholder="10-digit mobile number"')}
        ${selectField("bedrooms", "Bedroom", [
          {value:"1",label:"1"}, {value:"2",label:"2"}, {value:"3",label:"3"},
          {value:"4",label:"4"}, {value:"5+",label:"5+"}
        ])}
        ${selectField("bathrooms", "Bathroom", [
          {value:"1",label:"1"}, {value:"2",label:"2"}, {value:"3",label:"3"},
          {value:"4+",label:"4+"}
        ])}
        ${selectField("parking", "Parking", [
          {value:"Yes",label:"Yes"}, {value:"No",label:"No"}
        ])}
        ${selectField("kitchen", "Kitchen", [
          {value:"Yes",label:"Yes"}, {value:"No",label:"No"}
        ])}
        ${descriptionField}
      `;
    } else if (type === "room") {
      html = `
        ${field("propertyTitle", "Title", "text", 'placeholder="Enter room title"')}
        ${priceField}
        ${field("propertyArea", "Size", "text", 'placeholder="e.g. 250 sq.ft"')}
        ${field("ownerContact", "Contact Number", "tel", 'inputmode="numeric" maxlength="10" placeholder="10-digit mobile number"')}
        ${selectField("bathrooms", "Bathroom", [
          {value:"1",label:"1"}, {value:"2",label:"2"}, {value:"3+",label:"3+"}
        ])}
        ${selectField("kitchen", "Kitchen", [
          {value:"Yes",label:"Yes"}, {value:"No",label:"No"}
        ])}
        ${selectField("parking", "Parking", [
          {value:"Yes",label:"Yes"}, {value:"No",label:"No"}
        ])}
        ${descriptionField}
      `;
    } else if (type === "shop") {
      html = `
        ${field("propertyTitle", "Title", "text", 'placeholder="Enter shop title"')}
        ${priceField}
        ${field("propertyArea", "Size", "text", 'placeholder="e.g. 350 sq.ft"')}
        ${field("ownerContact", "Contact Number", "tel", 'inputmode="numeric" maxlength="10" placeholder="10-digit mobile number"')}
        ${selectField("parking", "Parking", [
          {value:"Yes",label:"Yes"}, {value:"No",label:"No"}
        ])}
        ${selectField("bathrooms", "Bathroom", [
          {value:"1",label:"1"}, {value:"2",label:"2"}, {value:"3+",label:"3+"}
        ])}
        ${descriptionField}
      `;
    } else if (type === "commercial") {
      html = `
        ${field("propertyTitle", "Title", "text", 'placeholder="Enter commercial property title"')}
        ${priceField}
        ${field("propertyArea", "Size", "text", 'placeholder="e.g. 2500 sq.ft"')}
        ${field("ownerContact", "Contact Number", "tel", 'inputmode="numeric" maxlength="10" placeholder="10-digit mobile number"')}
        ${selectField("kitchen", "Kitchen", [
          {value:"Yes",label:"Yes"}, {value:"No",label:"No"}
        ])}
        ${selectField("bathrooms", "Bathroom", [
          {value:"1",label:"1"}, {value:"2",label:"2"}, {value:"3+",label:"3+"}
        ])}
        ${selectField("parking", "Parking", [
          {value:"Yes",label:"Yes"}, {value:"No",label:"No"}
        ])}
        ${descriptionField}
      `;
    } else if (type === "plot") {
      html = `
        ${field("propertyTitle", "Title", "text", 'placeholder="Enter plot title"')}
        ${field("propertyArea", "Size (sq. ft.)", "number", 'min="0" inputmode="decimal" placeholder="Enter area in square feet"')}
        ${priceField}
        ${field("ownerContact", "Contact Number", "tel", 'inputmode="numeric" maxlength="10" placeholder="10-digit mobile number"')}
        ${selectField("allPapers", "All Papers", [
          {value:"Yes",label:"Yes"}, {value:"No",label:"No"}
        ])}
        ${descriptionField}
      `;
    } else {
      html = `
        ${field("propertyTitle", "Title", "text", 'placeholder="Enter property title"')}
        ${field("otherType", "Type", "text", 'placeholder="Enter property type"')}
        ${field("propertyArea", "Size", "text", 'placeholder="Enter property size"')}
        ${field("ownerContact", "Contact Number", "tel", 'inputmode="numeric" maxlength="10" placeholder="10-digit mobile number"')}
        ${descriptionField}
      `;
    }

    formGrid.innerHTML = html;
  }

  const contact = document.getElementById("ownerContact");
  contact?.addEventListener("input", () => {
    contact.value = contact.value.replace(/\D/g, "").slice(0, 10);
  });

  document.getElementById("detailsContinue")?.addEventListener("click", () => {
    const value = id => document.getElementById(id)?.value?.trim() || "";

    const title = value("propertyTitle");
    const price = value("propertyPrice");
    const ownerContact = value("ownerContact").replace(/\D/g, "");
    const area = value("propertyArea");
    const bedrooms = value("bedrooms");
    const bathrooms = value("bathrooms");
    const kitchen = value("kitchen");
    const parking = value("parking");
    const allPapers = value("allPapers");
    const otherType = value("otherType");
    const description = value("description");

    if (!title) {
      alert("Please enter property title.");
      return;
    }

    // Price is required for every type except Other.
    if (type !== "other" && !price) {
      alert(isRent ? "Please enter monthly rent." : "Please enter total amount.");
      return;
    }

    if (!ownerContact || !/^[6-9]\d{9}$/.test(ownerContact)) {
      alert("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    if (!area) {
      alert(type === "plot" ? "Please enter plot size in square feet." : "Please enter property size.");
      return;
    }

    if (!description) {
      alert("Please enter property description.");
      return;
    }

    localStorage.setItem("flowPropertyDetails", JSON.stringify({
      title,
      price,
      contact: ownerContact,
      area,
      bedrooms,
      bathrooms,
      kitchen,
      parking,
      allPapers,
      otherType,
      description
    }));

    window.location.href = "property-media.html";
  });
}


/* =========================================================
   PROPERTY MEDIA PAGE
========================================================= */

function initMediaPage() {

  let setup = null;
  let details = null;


  try {

    setup =
      JSON.parse(
        localStorage.getItem(
          "flowPropertySetup"
        ) || "null"
      );


    details =
      JSON.parse(
        localStorage.getItem(
          "flowPropertyDetails"
        ) || "null"
      );

  } catch {

    setup = null;
    details = null;

  }


  if (
    !setup?.listingType ||
    !setup?.propertyType ||
    !details?.title
  ) {

    window.location.href =
      "post-property.html";

    return;

  }


  const pretty = {

    house: "House",
    flat: "Flat",
    room: "Rooms",
    shop: "Shop",
    commercial: "Commercial",
    plot: "Plot",
    other: "Other"

  };


  const summary =
    document.getElementById(
      "mediaSelectionSummary"
    );


  if (summary) {

    summary.innerHTML = `

      <span class="summary-pill">

        ${
          setup.listingType === "rent"
            ? "🏠 Rent"
            : "💰 Sell"
        }

      </span>


      <span class="summary-pill">

        ${iconFor(
          setup.propertyType
        )}

        ${pretty[
          setup.propertyType
        ]}

      </span>

    `;

  }


  const photoInput =
    document.getElementById(
      "photoInput"
    );


  const photoText =
    document.getElementById(
      "photoText"
    );


  const preview =
    document.getElementById(
      "photoPreview"
    );


  let photoData = [];


  photoInput?.addEventListener(
    "change",
    async () => {

      const files =
        Array.from(
          photoInput.files || []
        )
        .filter(
          file =>
            file.type.startsWith(
              "image/"
            )
        )
        .slice(
          0,
          10
        );


      photoData = [];


      if (preview) {
        preview.innerHTML =
          "";
      }


      for (
        const file of files
      ) {

        try {

          const data =
            await readFile(
              file
            );


          photoData.push(
            data
          );


          const image =
            document.createElement(
              "img"
            );


          image.src =
            data;


          preview?.appendChild(
            image
          );

        } catch (error) {

          console.error(
            "Could not read image:",
            error
          );

        }

      }


      if (photoText) {

        photoText.textContent =
          files.length

            ? `${files.length} photo(s) selected`

            : "Add up to 10 clear photos of your property";

      }

    }
  );


  document
    .getElementById(
      "publishProperty"
    )
    ?.addEventListener(
      "click",
      () => {

        const location =
          document
            .getElementById(
              "propertyLocation"
            )
            ?.value.trim() ||
          "";


        if (!location) {

          alert(
            "Please enter property location."
          );

          return;

        }


        const property = {

          id:
            Date.now(),

          title:
            details.title,

          price:
            details.price,

          contact:
            details.contact,

          area:
            details.area,

          bedrooms:
            details.bedrooms,

          bathrooms:
            details.bathrooms,

          kitchen:
            details.kitchen,

          parking:
            details.parking,

          allPapers:
            details.allPapers,

          otherType:
            details.otherType,

          description:
            details.description,

          location,

          propertyType:
            setup.propertyType,

          listingType:
            setup.listingType,

          photos:
            photoData,

          ownerKey:
            getCurrentFlowOwnerKey(),

          status:
            "active",

          createdAt:
            new Date().toISOString()

        };


        let all = [];


        try {

          all =
            JSON.parse(
              localStorage.getItem(
                "flowProperties"
              ) || "[]"
            );


          if (
            !Array.isArray(all)
          ) {
            all = [];
          }

        } catch {

          all = [];

        }


        all.unshift(
          property
        );


        try {

          localStorage.setItem(
            "flowProperties",
            JSON.stringify(all)
          );

        } catch (error) {

          console.error("Unable to save property:", error);

          alert(
            "Storage is full. Please delete an old posted property from this browser and try again."
          );

          return;

        }


        localStorage.setItem(
          "flowLocation",
          shortLocation(
            location
          )
        );


        localStorage.removeItem(
          "flowPropertySetup"
        );


        localStorage.removeItem(
          "flowPropertyDetails"
        );


        alert(
          "🎉 Property published successfully!"
        );


        window.location.href =
          "index.html";

      }
    );

}


/* =========================================================
   PROPERTY VIEW PAGE
========================================================= */

function initPropertyView() {

  let property = null;

  /* Resolve both formats used by the app:
     1) full property object
     2) property ID stored by cards/saved page */
  try {
    const selected = JSON.parse(
      localStorage.getItem("flowSelectedProperty") || "null"
    );

    if (selected && typeof selected === "object") {
      property = selected;
    } else if (selected !== null && selected !== undefined) {
      const properties = JSON.parse(
        localStorage.getItem("flowProperties") || "[]"
      );

      if (Array.isArray(properties)) {
        property = properties.find(
          item => String(item.id) === String(selected)
        ) || null;
      }
    }
  } catch {
    property = null;
  }

  if (!property) {

    alert(
      "Property details not found."
    );


    window.location.href =
      "index.html";


    return;

  }


  const $ =
    id =>
      document.getElementById(
        id
      );


  const title =
    $("viewPropertyTitle");


  const price =
    $("viewPropertyPrice");


  const location =
    $("viewPropertyLocation");


  const locationCard =
    $("locationCardText");


  const area =
    $("viewPropertyArea");


  const description =
    $("viewPropertyDescription");


  const bedrooms =
    $("viewBedrooms");


  const bathrooms =
    $("viewBathrooms");


  const propertyType =
    $("viewPropertyType");


  const listingType =
    $("viewListingType");


  const badge =
    $("viewListingBadge");


  const ownerName =
    $("viewOwnerName");


  const mainImage =
    $("mainPropertyImage");


  const placeholder =
    $("propertyImagePlaceholder");


  const galleryCount =
    $("galleryCount");


  const thumbnails =
    $("propertyThumbnails");


  const propertyTitle =
    property.title ||
    "Property";


  const propertyPrice =
    property.price ||
    "Price on request";


  const propertyLocation =
    property.location ||
    "Location not available";


  const propertyArea =
    property.area ||
    "Not specified";


  const propertyDescription =
    property.description ||
    "No description has been added for this property.";


  const propertyBedrooms =
    property.bedrooms ||
    "";


  const propertyBathrooms =
    property.bathrooms ||
    "";


  const type =
    property.propertyType ||
    property.category ||
    "other";


  const listing =
    property.listingType ||
    property.type ||
    "rent";


  /* =======================================================
     BASIC INFORMATION
  ======================================================= */

  if (title) {
    title.textContent =
      propertyTitle;
  }


  if (price) {
    price.textContent =
      propertyPrice;
  }


  if (location) {
    location.textContent =
      propertyLocation;
  }


  if (locationCard) {
    locationCard.textContent =
      propertyLocation;
  }


  if (area) {
    area.textContent =
      propertyArea;
  }


  if (description) {
    description.textContent =
      propertyDescription;
  }


  if (bedrooms) {

    bedrooms.textContent =
      propertyBedrooms

        ? String(
            propertyBedrooms
          ).replace(
            /[^0-9+]/g,
            ""
          )

        : "—";

  }


  if (bathrooms) {

    bathrooms.textContent =
      propertyBathrooms ||
      "—";

  }


  /* =======================================================
     PROPERTY TYPE
  ======================================================= */

  const propertyNames = {

    house: "House",
    home: "House",
    flat: "Flat",
    room: "Room",
    shop: "Shop",
    commercial: "Commercial",
    plot: "Plot",
    other: "Other"

  };


  if (propertyType) {

    propertyType.textContent =
      propertyNames[type] ||
      "Property";

  }


  /* =======================================================
     RENT / SALE
  ======================================================= */

  const isSale =
    listing === "sell" ||
    listing === "sale";


  if (listingType) {

    listingType.textContent =
      isSale
        ? "For Sale"
        : "For Rent";

  }


  if (badge) {

    badge.textContent =
      isSale
        ? "FOR SALE"
        : "FOR RENT";


    badge.classList.toggle(
      "sale",
      isSale
    );

  }


  /* =======================================================
     OWNER
  ======================================================= */

  if (ownerName) {

    ownerName.textContent =
      property.ownerName ||
      property.owner ||
      "Property Owner";

  }


  /* =======================================================
     HIDE EMPTY FEATURES
  ======================================================= */

  if (!propertyBedrooms) {

    $("bedroomFeature")
      ?.style.setProperty(
        "display",
        "none"
      );

  }


  if (!propertyBathrooms) {

    $("bathroomFeature")
      ?.style.setProperty(
        "display",
        "none"
      );

  }


  /* =======================================================
     PHOTOS
  ======================================================= */

  let photos =
    Array.isArray(
      property.photos
    )

      ? property.photos.filter(
          photo =>
            typeof photo ===
              "string" &&
            photo.trim() !== ""
        )

      : [];


  let currentImage = 0;


  /* =======================================================
     THUMBNAILS
  ======================================================= */

  function updateThumbnails() {

    if (!thumbnails) {
      return;
    }


    thumbnails.innerHTML =
      photos
        .map(
          (photo, index) => `

            <button
              type="button"
              class="property-thumbnail ${
                index === currentImage
                  ? "active"
                  : ""
              }"
              data-index="${index}"
            >

              <img
                src="${escapeHtml(
                  photo
                )}"
                alt="Property photo ${
                  index + 1
                }"
              >

            </button>

          `
        )
        .join("");


    thumbnails
      .querySelectorAll(
        ".property-thumbnail"
      )
      .forEach(button => {

        button.addEventListener(
          "click",
          () => {

            showImage(
              Number(
                button.dataset.index
              )
            );

          }
        );

      });

  }


  /* =======================================================
     SHOW IMAGE
  ======================================================= */

  function showImage(index) {

    if (!photos.length) {

      if (mainImage) {

        mainImage.classList.remove(
          "loaded"
        );


        mainImage.style.display =
          "none";

      }


      if (placeholder) {

        placeholder.style.display =
          "flex";

      }


      if (galleryCount) {

        galleryCount.textContent =
          "1/1";

      }


      return;

    }


    currentImage =
      (
        index +
        photos.length
      ) %
      photos.length;


    if (placeholder) {

      placeholder.style.display =
        "none";

    }


    if (mainImage) {

      mainImage.src =
        photos[
          currentImage
        ];


      mainImage.alt =
        propertyTitle;


      mainImage.classList.add(
        "loaded"
      );


      mainImage.style.display =
        "block";


      mainImage.onerror =
        () => {

          mainImage.style.display =
            "none";


          if (placeholder) {

            placeholder.style.display =
              "flex";

          }

        };

    }


    if (galleryCount) {

      galleryCount.textContent =
        `${
          currentImage + 1
        }/${photos.length}`;

    }


    updateThumbnails();

  }


  showImage(0);


  /* =======================================================
     NEXT IMAGE
  ======================================================= */

  $("galleryNext")
    ?.addEventListener(
      "click",
      () => {

        showImage(
          currentImage + 1
        );

      }
    );


  /* =======================================================
     PREVIOUS IMAGE
  ======================================================= */

  $("galleryPrev")
    ?.addEventListener(
      "click",
      () => {

        showImage(
          currentImage - 1
        );

      }
    );


  /* =======================================================
     BACK
  ======================================================= */

  $("propertyBackBtn")
    ?.addEventListener(
      "click",
      event => {

        event.preventDefault();

        /* Always return to the app home. This also works when
           property-view.html was opened directly/bookmarked. */
        window.location.href = "index.html";

      }
    );


  /* =======================================================
     READ MORE
  ======================================================= */

  const readMore =
    $("readMoreBtn");


  readMore?.addEventListener(
    "click",
    () => {

      if (!description) {
        return;
      }


      description.classList.toggle(
        "expanded"
      );


      readMore.textContent =
        description.classList.contains(
          "expanded"
        )

          ? "Show Less"

          : "Read More";

    }
  );


  /* =======================================================
     SAVE
  ======================================================= */

  const saveButton =
    $("saveViewPropertyBtn");


  saveButton?.addEventListener(
    "click",
    () => {

      let saved = [];


      try {

        saved =
          JSON.parse(
            localStorage.getItem(
              "flowSavedProperties"
            ) || "[]"
          );


        if (
          !Array.isArray(saved)
        ) {
          saved = [];
        }

      } catch {

        saved = [];

      }


      const propertyId =
        property.id;


      const normalizedSaved = saved.map(String);
      const normalizedId = String(propertyId);

      const alreadySaved =
        normalizedSaved.includes(
          normalizedId
        );


      if (alreadySaved) {

        saved =
          saved.filter(
            id =>
              String(id) !== normalizedId
          );


        saveButton.textContent =
          "♡";

      } else {

        saved.push(
          normalizedId
        );


        saveButton.textContent =
          "♥";

      }


      localStorage.setItem(
        "flowSavedProperties",
        JSON.stringify(
          saved
        )
      );

    }
  );


  /* =======================================================
     CHECK SAVED
  ======================================================= */

  try {

    const saved =
      JSON.parse(
        localStorage.getItem(
          "flowSavedProperties"
        ) || "[]"
      );


    if (
      saved.map(String).includes(
        String(property.id)
      )
    ) {

      if (saveButton) {

        saveButton.textContent =
          "♥";

      }

    }

  } catch {}


  /* =======================================================
     SHARE
  ======================================================= */

  $("sharePropertyBtn")
    ?.addEventListener(
      "click",
      async () => {

        const shareData = {

          title:
            propertyTitle,

          text:
            `${propertyTitle} — ${propertyPrice}, ${propertyLocation}`,

          url:
            window.location.href

        };


        try {

          if (
            navigator.share
          ) {

            await navigator.share(
              shareData
            );

          } else {

            await navigator.clipboard.writeText(
              window.location.href
            );


            alert(
              "Property link copied!"
            );

          }

        } catch {

          console.log(
            "Share cancelled."
          );

        }

      }
    );


  /* =======================================================
     OWNER PHONE
  ======================================================= */

  function ownerPhone() {

    return String(
      property.contact ||
      property.ownerPhone ||
      ""
    ).replace(
      /\D/g,
      ""
    );

  }


  /* =======================================================
     CALL
  ======================================================= */

  $("callOwnerBtn")
    ?.addEventListener(
      "click",
      () => {

        const phone =
          ownerPhone();


        if (!phone) {

          alert(
            "Owner contact number is not available."
          );


          return;

        }


        window.location.href =
          `tel:${phone}`;

      }
    );


  /* =======================================================
     WHATSAPP
  ======================================================= */

  $("whatsappOwnerBtn")
    ?.addEventListener(
      "click",
      () => {

        const phone =
          ownerPhone();


        if (!phone) {

          alert(
            "Owner WhatsApp number is not available."
          );


          return;

        }


        const message =
          encodeURIComponent(
            `Hi, I am interested in your property "${propertyTitle}" listed on Flow.`
          );


        window.open(
          `https://wa.me/91${phone}?text=${message}`,
          "_blank"
        );

      }
    );


  /* =======================================================
     PROFILE
  ======================================================= */

  $("viewProfileBtn")
    ?.addEventListener(
      "click",
      () => {

        alert(
          "Owner profile will be available soon."
        );

      }
    );


  /* =======================================================
     DIRECTIONS
  ======================================================= */

  $("directionsBtn")
    ?.addEventListener(
      "click",
      () => {

        const destination =
          encodeURIComponent(
            propertyLocation
          );


        window.open(
          `https://www.google.com/maps/search/?api=1&query=${destination}`,
          "_blank"
        );

      }
    );

}


/* =========================================================
   STATIC / DEMO PROPERTY CARDS

   IMPORTANT:
   User-posted cards have:
      card.dataset.id

   Demo cards don't have data-id.

   So this handler ONLY works for demo cards.
   It will NEVER overwrite user property data.
========================================================= */

document.addEventListener(
  "click",
  event => {

    const card =
      event.target.closest(
        ".property-card"
      );


    if (!card) {
      return;
    }


    /*
      VERY IMPORTANT:

      Real user property already has
      data-id.

      Therefore DON'T TOUCH IT.
    */

    if (card.dataset.id) {
      return;
    }


    if (
      event.target.closest(
        ".save-btn"
      )
    ) {
      return;
    }


    const cardTitle =
      card
        .querySelector(
          ".property-details h3"
        )
        ?.textContent
        .trim() ||
      "Property";


    const cardLocation =
      card.dataset.location ||

      card
        .querySelector(
          ".property-location"
        )
        ?.textContent
        .replace(
          "📍",
          ""
        )
        .trim() ||

      "Nokha, Bikaner";


    const cardPrice =
      card
        .querySelector(
          ".property-info-row strong"
        )
        ?.textContent
        .trim() ||

      "Price on request";


    const cardInfo =
      card
        .querySelector(
          ".property-info-row span"
        )
        ?.textContent
        .trim() ||

      "";


    const category =
      card.dataset.category ||
      "house";


    const type =
      card.dataset.type ||
      "rent";


    const badge =
      card
        .querySelector(
          ".badge"
        )
        ?.textContent
        .trim()
        .toLowerCase() ||

      "";


    const demoProperty = {

      id:
        "demo-" +
        Date.now(),

      title:
        cardTitle,

      price:
        cardPrice,

      location:
        cardLocation,

      area:
        cardInfo,

      bedrooms:
        cardInfo,

      bathrooms:
        "",

      description:
        `This ${category} is available in ${cardLocation}. Contact the owner for complete property details, availability and more information.`,

      propertyType:
        category,

      listingType:
        type === "sell" ||
        badge.includes("sale")

          ? "sell"

          : "rent",

      photos:
        Array.from(
          card.querySelectorAll("img")
        )
          .map(img => img.currentSrc || img.src)
          .filter(Boolean)
          .slice(0, 10),

      ownerName:
        "Property Owner",

      contact:
        ""

    };


    /* Store demo/static cards too, so their image and data
       survive when the property-view page opens. */
    let properties = [];

    try {
      properties = JSON.parse(
        localStorage.getItem("flowProperties") || "[]"
      );
      if (!Array.isArray(properties)) properties = [];
    } catch {
      properties = [];
    }

    const existingIndex = properties.findIndex(
      item => String(item.id) === String(demoProperty.id)
    );

    if (existingIndex === -1) {
      properties.push(demoProperty);
    }

    try {
      localStorage.setItem(
        "flowProperties",
        JSON.stringify(properties)
      );
    } catch {
      /* If storage is full, the selected object still works. */
    }

    localStorage.setItem(
      "flowSelectedProperty",
      String(demoProperty.id)
    );

    window.location.href =
      "property-view.html";

  },

  true
);
/* =========================================================
   SAVED PROPERTIES
========================================================= */

function getSavedPropertyIds() {
  try {
    return JSON.parse(
      localStorage.getItem("flowSavedProperties") || "[]"
    ).map(String);
  } catch (error) {
    return [];
  }
}


/* SAVE / UNSAVE PROPERTY */

function toggleSavedProperty(propertyId) {

  const id = String(propertyId);

  let savedIds = getSavedPropertyIds();

  if (savedIds.includes(id)) {

    savedIds = savedIds.filter(
      savedId => savedId !== id
    );

  } else {

    savedIds.push(id);

  }

  localStorage.setItem(
    "flowSavedProperties",
    JSON.stringify(savedIds)
  );

  renderSavedProperties();

  return savedIds.includes(id);
}


/* CHECK WHETHER PROPERTY IS SAVED */

function isPropertySaved(propertyId) {

  const savedIds = getSavedPropertyIds();

  return savedIds.includes(
    String(propertyId)
  );
}


/* RENDER SAVED PROPERTIES */

function renderSavedProperties() {

  const container =
    document.getElementById("savedPropertiesGrid");

  const emptyState =
    document.getElementById("savedEmptyState");

  if (!container) return;

  let properties = [];

  try {

    properties = JSON.parse(
      localStorage.getItem("flowProperties") || "[]"
    );

  } catch (error) {

    properties = [];

  }


  const savedIds = getSavedPropertyIds();


  const savedProperties = properties.filter(property =>
    savedIds.includes(String(property.id))
  );


  container.innerHTML = "";


  if (savedProperties.length === 0) {

    container.style.display = "none";

    if (emptyState) {
      emptyState.style.display = "flex";
    }

    return;
  }


  container.style.display = "grid";

  if (emptyState) {
    emptyState.style.display = "none";
  }


  savedProperties.forEach(property => {

    const card =
      document.createElement("article");

    card.className = "saved-property-card";

    const photo =
      property.photos &&
      property.photos.length
        ? property.photos[0]
        : "";


    const listingType =
      property.listingType === "sell"
        ? "FOR SALE"
        : "FOR RENT";


    const price =
      property.price
        ? `₹${Number(property.price).toLocaleString("en-IN")}`
        : "Price on request";


    const propertyType =
      property.propertyType || "Property";


    const bedrooms =
      property.bedrooms
        ? `${property.bedrooms} BHK`
        : "";


    const area =
      property.area
        ? `${property.area} sq.ft`
        : "";


    card.innerHTML = `

      <div class="saved-property-image">

        ${
          photo
            ? `<img src="${photo}" alt="${property.title || "Property"}">`
            : `<div class="saved-no-image">🏠</div>`
        }

        <span class="saved-badge">
          ${listingType}
        </span>

        <button
          class="saved-heart-btn"
          data-save-id="${property.id}"
          aria-label="Remove saved property"
        >
          ♥
        </button>

      </div>


      <div class="saved-property-content">

        <div class="saved-property-top">

          <div>

            <h3>
              ${property.title || "Untitled Property"}
            </h3>

            <p class="saved-property-type">
              ${bedrooms}
              ${bedrooms && propertyType ? " · " : ""}
              ${propertyType}
            </p>

          </div>

          <span class="saved-arrow">
            ›
          </span>

        </div>


        <p class="saved-location">
          📍 ${property.location || "Location not available"}
        </p>


        <div class="saved-price">

          ${price}

          ${
            property.listingType === "sell"
              ? ""
              : `<span>/ month</span>`
          }

        </div>


        <div class="saved-property-meta">

          ${
            bedrooms
              ? `<span>${bedrooms}</span>`
              : ""
          }

          ${
            area
              ? `<span>${area}</span>`
              : ""
          }

          ${
            property.bathrooms
              ? `<span>${property.bathrooms} Bath</span>`
              : ""
          }

        </div>

      </div>

    `;


    /* OPEN PROPERTY */

    card.addEventListener(
      "click",
      function(event) {

        if (
          event.target.closest(
            ".saved-heart-btn"
          )
        ) {
          return;
        }


        /*
          IMPORTANT:
          Only property ID is stored.
          Photos are NOT copied again.
        */

        localStorage.setItem(
          "flowSelectedProperty",
          String(property.id)
        );


        window.location.href =
          "property-view.html";

      }
    );


    /* REMOVE FROM SAVED */

    const heart =
      card.querySelector(
        ".saved-heart-btn"
      );


    heart.addEventListener(
      "click",
      function(event) {

        event.stopPropagation();

        toggleSavedProperty(
          property.id
        );

      }
    );


    container.appendChild(card);

  });

}


/* CLEAR ALL SAVED */

function clearAllSavedProperties() {

  localStorage.removeItem(
    "flowSavedProperties"
  );

  renderSavedProperties();

}


/* CLEAR ALL BUTTON */

document.addEventListener(
  "click",
  function(event) {

    if (
      event.target.closest(
        "#clearSavedBtn"
      )
    ) {

      const savedIds =
        getSavedPropertyIds();

      if (!savedIds.length) {
        return;
      }


      const confirmClear =
        confirm(
          "Remove all saved properties?"
        );


      if (confirmClear) {

        clearAllSavedProperties();

      }

    }

  }
);


/* BROWSE PROPERTIES */

document.addEventListener(
  "click",
  function(event) {

    if (
      event.target.closest(
        "#browsePropertiesBtn"
      )
    ) {

      /*
        Change this if your Home navigation
        uses a different function.
      */

      const homeButton =
        document.querySelector(
          '[data-page="home"]'
        );

      if (homeButton) {
        homeButton.click();
      }

    }

  }
);



/* =========================================================
   PROFILE TAB
   Only runs when the Profile tab is used.
========================================================= */

const FLOW_PROFILE_SUPABASE_URL = "https://ihbpddlzmyxajfbpdrpb.supabase.co";
const FLOW_PROFILE_SUPABASE_KEY = "sb_publishable_mAmh160qISZEml5IXDw_xw_H-kZBqoj";

let flowProfileClient = null;

function getFlowProfileClient() {
  if (!flowProfileClient && window.supabase?.createClient) {
    flowProfileClient = window.supabase.createClient(
      FLOW_PROFILE_SUPABASE_URL,
      FLOW_PROFILE_SUPABASE_KEY
    );
  }
  return flowProfileClient;
}

function getLocalFlowProperties() {
  try {
    const properties = JSON.parse(
      localStorage.getItem("flowProperties") || "[]"
    );
    return Array.isArray(properties) ? properties : [];
  } catch {
    return [];
  }
}

function getProfileInitial(name = "U") {
  const clean = String(name).trim();
  return clean ? clean.charAt(0).toUpperCase() : "U";
}

function getProfileDataFallback() {
  try {
    const saved = JSON.parse(
      localStorage.getItem("flowUserProfile") || "null"
    );
    if (saved && typeof saved === "object") return saved;
  } catch {}

  return {
    full_name: "User",
    phone: "",
    email: ""
  };
}

async function getFlowProfileData() {
  const fallback = getProfileDataFallback();

  try {
    const client = getFlowProfileClient();
    if (!client) return fallback;

    const {
      data: { user }
    } = await client.auth.getUser();

    if (!user) return fallback;

    const metadata = user.user_metadata || {};

    const profile = {
      full_name:
        metadata.full_name ||
        metadata.name ||
        fallback.full_name ||
        "User",
      phone:
        metadata.phone ||
        fallback.phone ||
        "",
      email:
        user.email ||
        fallback.email ||
        ""
    };

    localStorage.setItem(
      "flowUserProfile",
      JSON.stringify(profile)
    );

    return profile;
  } catch (error) {
    console.warn("Profile data could not be loaded:", error);
    return fallback;
  }
}

function migrateFlowPropertyOwnership(profile) {
  const ownerKey = profile?.email
    ? `email:${String(profile.email).trim().toLowerCase()}`
    : profile?.phone
      ? `phone:${String(profile.phone).replace(/\D/g, "")}`
      : "local-browser-user";

  const properties = getLocalFlowProperties();
  let changed = false;

  properties.forEach(property => {
    if (property?.createdAt && (!property.ownerKey || property.ownerKey === "local-browser-user")) {
      property.ownerKey = ownerKey;
      if (!property.status) property.status = "active";
      changed = true;
    }
  });

  if (changed) {
    try {
      localStorage.setItem("flowProperties", JSON.stringify(properties));
    } catch {}
  }
}

function renderProfileUser(profile) {
  const name = profile?.full_name || "User";
  const phone = profile?.phone || "Mobile number not available";

  const nameEl = document.getElementById("profileUserName");
  const phoneEl = document.getElementById("profileUserPhone");
  const avatarEl = document.getElementById("profileAvatar");

  if (nameEl) nameEl.textContent = name;
  if (phoneEl) phoneEl.textContent = phone;
  if (avatarEl) avatarEl.textContent = getProfileInitial(name);
}

function formatProfilePrice(value, listingType) {
  if (value === undefined || value === null || value === "") {
    return "Price on request";
  }

  const raw = String(value).replace(/,/g, "").trim();
  const numeric = Number(raw);

  if (Number.isFinite(numeric)) {
    return `₹${numeric.toLocaleString("en-IN")}${listingType === "rent" ? " / month" : ""}`;
  }

  return String(value);
}

function getCurrentFlowOwnerKey() {
  try {
    const saved = JSON.parse(localStorage.getItem("flowUserProfile") || "null");
    if (saved?.email) return `email:${String(saved.email).trim().toLowerCase()}`;
    if (saved?.phone) return `phone:${String(saved.phone).replace(/\D/g, "")}`;
  } catch {}
  return "local-browser-user";
}

function getMyListingProperties() {
  const properties = getLocalFlowProperties();
  const ownerKey = getCurrentFlowOwnerKey();
  let changed = false;

  const listings = properties.filter(property => {
    if (!property?.createdAt) return false;

    // Older locally-posted properties did not have an ownerKey.
    // Keep them linked to this browser user and migrate them once.
    if (!property.ownerKey) {
      property.ownerKey = ownerKey;
      if (!property.status) property.status = "active";
      changed = true;
      return true;
    }

    return property.ownerKey === ownerKey;
  });

  if (changed) {
    try {
      localStorage.setItem("flowProperties", JSON.stringify(properties));
    } catch {}
  }

  return listings;
}

function updateMyListing(propertyId, action) {
  const properties = getLocalFlowProperties();
  const id = String(propertyId);
  const index = properties.findIndex(property => String(property?.id) === id);

  if (index === -1) return false;

  if (action === "delete") {
    properties.splice(index, 1);
  } else if (action === "sold_out") {
    properties[index].status = "sold_out";
  } else if (action === "active") {
    properties[index].status = "active";
  } else {
    return false;
  }

  try {
    localStorage.setItem("flowProperties", JSON.stringify(properties));
    return true;
  } catch (error) {
    console.error("Unable to update listing:", error);
    alert("Unable to update this property right now.");
    return false;
  }
}

function closeAllListingMenus() {
  document.querySelectorAll(".listing-actions-menu.is-open").forEach(menu => {
    menu.classList.remove("is-open");
  });
}

function renderMyListings() {
  const grid = document.getElementById("profileListingsGrid");
  const empty = document.getElementById("profileListingsEmpty");

  if (!grid) return;

  const listings = getMyListingProperties();

  grid.innerHTML = "";

  if (!listings.length) {
    grid.style.display = "none";
    if (empty) {
      empty.style.display = "flex";
      const emptyTitle = empty.querySelector("h3");
      const emptyText = empty.querySelector("p");
      if (emptyTitle) emptyTitle.textContent = "No Listings Yet";
      if (emptyText) emptyText.textContent = "Properties you post will appear here.";
    }
    return;
  }

  grid.style.display = "grid";
  if (empty) empty.style.display = "none";

  listings.forEach(property => {
    const card = document.createElement("article");
    card.className = "profile-property-card";

    const photo = property.photos?.[0] || "";
    const type = property.listingType === "sell" ? "FOR SALE" : "FOR RENT";
    const isSoldOut = property.status === "sold_out";
    const statusText = isSoldOut ? "SOLD OUT" : type;

    card.innerHTML = `
      <div class="profile-property-photo">
        ${
          photo
            ? `<img src="${escapeHtml(photo)}" alt="${escapeHtml(property.title || "Property")}">`
            : `<div class="profile-property-placeholder">${iconFor(property.propertyType)}</div>`
        }
        <span class="${isSoldOut ? "listing-status-sold" : ""}">${statusText}</span>
        <button type="button" class="listing-actions-btn" aria-label="Manage listing" aria-expanded="false">⋮</button>
        <div class="listing-actions-menu">
          <button type="button" data-listing-action="delete">Delete</button>
          ${
            isSoldOut
              ? `<button type="button" data-listing-action="active">Re-sold</button>`
              : `<button type="button" data-listing-action="sold_out">Sold out</button>`
          }
        </div>
      </div>
      <div class="profile-property-body">
        <h3>${escapeHtml(property.title || "Untitled Property")}</h3>
        <p>📍 ${escapeHtml(property.location || "Location not available")}</p>
        <strong>${escapeHtml(formatProfilePrice(property.price, property.listingType))}</strong>
      </div>
    `;

    const dots = card.querySelector(".listing-actions-btn");
    const menu = card.querySelector(".listing-actions-menu");

    dots?.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();
      const willOpen = !menu?.classList.contains("is-open");
      closeAllListingMenus();
      if (willOpen) {
        menu?.classList.add("is-open");
        dots.setAttribute("aria-expanded", "true");
      }
    });

    menu?.querySelectorAll("[data-listing-action]").forEach(actionButton => {
      actionButton.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();

        const action = actionButton.dataset.listingAction;

        if (action === "delete") {
          const confirmed = confirm("Delete this property permanently? This action cannot be undone.");
          if (!confirmed) return;
        }

        if (!updateMyListing(property.id, action)) return;

        closeAllListingMenus();
        renderMyListings();
      });
    });

    card.addEventListener("click", event => {
      if (event.target.closest(".listing-actions-btn, .listing-actions-menu")) return;

      localStorage.setItem("flowSelectedProperty", String(property.id));
      window.location.href = "property-view.html";
    });

    grid.appendChild(card);
  });
}

// Close any open three-dot menu when clicking elsewhere.
document.addEventListener("click", event => {
  if (!event.target.closest(".listing-actions-btn, .listing-actions-menu")) {
    closeAllListingMenus();
  }
});

function getFlowEnquiries() {
  try {
    const enquiries = JSON.parse(
      localStorage.getItem("flowEnquiries") || "[]"
    );
    return Array.isArray(enquiries) ? enquiries : [];
  } catch {
    return [];
  }
}

function renderMyEnquiries() {
  const list = document.getElementById("profileEnquiriesList");
  const empty = document.getElementById("profileEnquiriesEmpty");

  if (!list) return;

  const enquiries = getFlowEnquiries();
  list.innerHTML = "";

  if (!enquiries.length) {
    list.style.display = "none";
    if (empty) empty.style.display = "flex";
    return;
  }

  list.style.display = "flex";
  if (empty) empty.style.display = "none";

  enquiries.forEach(enquiry => {
    const item = document.createElement("article");
    item.className = "profile-enquiry-card";

    item.innerHTML = `
      <div class="profile-enquiry-icon">▤</div>
      <div>
        <strong>${escapeHtml(enquiry.propertyTitle || enquiry.title || "Property Enquiry")}</strong>
        <p>${escapeHtml(enquiry.message || enquiry.feedback || enquiry.text || "New enquiry received.")}</p>
        <small>${escapeHtml(enquiry.createdAt ? new Date(enquiry.createdAt).toLocaleString("en-IN") : "Recent")}</small>
      </div>
    `;

    list.appendChild(item);
  });
}

function showProfileMenu() {
  const profilePage = document.getElementById("profilePage");
  if (!profilePage) return;

  profilePage.querySelectorAll(".profile-subpage").forEach(panel => {
    panel.style.display = "none";
  });

  profilePage.querySelector(".profile-header").style.display = "";
  profilePage.querySelector(".profile-user-card").style.display = "";
  profilePage.querySelector(".profile-menu").style.display = "flex";

  document.body.classList.add("profile-active");
}

function showProfilePanel(panelId) {
  const profilePage = document.getElementById("profilePage");
  if (!profilePage) return;

  profilePage.querySelector(".profile-header").style.display = "none";
  profilePage.querySelector(".profile-user-card").style.display = "none";
  profilePage.querySelector(".profile-menu").style.display = "none";

  profilePage.querySelectorAll(".profile-subpage").forEach(panel => {
    panel.style.display = panel.id === panelId ? "block" : "none";
  });
}

function openProfileTab(event) {
  if (event) event.preventDefault();

  const profilePage = document.getElementById("profilePage");
  const main = document.querySelector("main");
  if (!profilePage || !main) return;

  const sections = Array.from(
    main.querySelectorAll(":scope > section")
  );

  sections.forEach(section => {
    section.style.display = section === profilePage ? "block" : "none";
  });

  document.querySelectorAll(".bottom-nav-item").forEach(item => {
    item.classList.remove("active");
  });

  document.getElementById("profileNavBtn")?.classList.add("active");

  showProfileMenu();
  renderMyListings();
  renderMyEnquiries();

  getFlowProfileData().then(renderProfileUser);

  history.replaceState(null, "", "#profilePage");
  profilePage.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

function closeProfileToHome(event) {
  if (event) event.preventDefault();

  const profilePage = document.getElementById("profilePage");
  const main = document.querySelector("main");
  if (!profilePage || !main) return;

  Array.from(
    main.querySelectorAll(":scope > section")
  ).forEach(section => {
    section.style.display = section === profilePage ? "none" : "";
  });

  document.querySelectorAll(".bottom-nav-item").forEach(item => {
    item.classList.remove("active");
  });

  document
    .querySelector('.bottom-nav-item[href="index.html"]')
    ?.classList.add("active");

  document.body.classList.remove("profile-active");
  history.replaceState(null, "", "index.html");
}

function initProfileTab() {
  const profileBtn = document.getElementById("profileNavBtn");
  const savedProfileBtn = document.querySelector(".saved-profile-btn");

  profileBtn?.addEventListener("click", openProfileTab);

  savedProfileBtn?.addEventListener("click", openProfileTab);

  document
    .getElementById("myListingsBtn")
    ?.addEventListener("click", () => {
      renderMyListings();
      showProfilePanel("profileListingsPanel");
    });

  document
    .getElementById("savedPropertiesBtn")
    ?.addEventListener("click", () => {
      document.getElementById("savedNavBtn")?.click();
    });

  document
    .getElementById("myEnquiriesBtn")
    ?.addEventListener("click", () => {
      renderMyEnquiries();
      showProfilePanel("profileEnquiriesPanel");
    });

  document
    .getElementById("helpSupportBtn")
    ?.addEventListener("click", () => {
      alert("For help and support, please contact the Flow support team.");
    });

  document
    .querySelectorAll("[data-profile-back]")
    .forEach(button => {
      button.addEventListener("click", showProfileMenu);
    });

  document
    .getElementById("viewEditProfileBtn")
    ?.addEventListener("click", () => {
      // Open a dedicated profile edit page.
      window.location.href = "profile-edit.html";
    });

  document
    .getElementById("profileLogoutBtn")
    ?.addEventListener("click", async () => {
      const confirmed = confirm("Are you sure you want to log out?");

      if (!confirmed) return;

      try {
        const client = getFlowProfileClient();
        await client?.auth.signOut();
      } catch (error) {
        console.warn("Logout error:", error);
      }

      localStorage.removeItem("flowUserProfile");
      window.location.href = "login.html";
    });

  getFlowProfileData().then(profile => {
    migrateFlowPropertyOwnership(profile);
    renderProfileUser(profile);
  });
}

document.addEventListener("DOMContentLoaded", initProfileTab);


/* SAVED TAB NAVIGATION - ROBUST */
document.addEventListener(
  "click",
  function(event) {

    const savedBtn = event.target.closest("#savedNavBtn");
    const browseBtn = event.target.closest("#browsePropertiesBtn");

    if (!savedBtn && !browseBtn) return;

    const savedPage = document.getElementById("savedPage");
    const main = document.querySelector("main");

    if (!savedPage || !main) return;

    event.preventDefault();
    event.stopPropagation();

    const sections = Array.from(
      main.querySelectorAll(":scope > section")
    );

    if (savedBtn) {
      sections.forEach(section => {
        section.style.display = section === savedPage ? "block" : "none";
      });

      document.querySelectorAll(".bottom-nav-item").forEach(item => {
        item.classList.remove("active");
      });

      savedBtn.classList.add("active");
      renderSavedProperties();

      history.replaceState(null, "", "#savedPage");

      savedPage.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });

      return;
    }

    if (browseBtn) {
      sections.forEach(section => {
        section.style.display = section === savedPage ? "none" : "";
      });

      document.querySelectorAll(".bottom-nav-item").forEach(item => {
        item.classList.remove("active");
      });

      document
        .querySelector('.bottom-nav-item[href="index.html"]')
        ?.classList.add("active");

      history.replaceState(null, "", "index.html");

      document.getElementById("propertyList")?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  },
  true
);




/* =========================================================
   EXPLORE PAGE
========================================================= */
function initExplore() {
  const locationBtn=document.getElementById("exploreLocationBtn"), selectedLocation=document.getElementById("exploreSelectedLocation"), overlay=document.getElementById("locationOverlay"), close=document.getElementById("closeLocation"), search=document.getElementById("locationSearch"), list=document.getElementById("locationsList"), categories=document.getElementById("exploreCategories"), grid=document.getElementById("explorePropertyList"), empty=document.getElementById("exploreEmpty"), count=document.getElementById("exploreResultCount"), title=document.getElementById("exploreResultTitle");
  if(!grid)return;
  let currentLocation=localStorage.getItem("flowLocation")||"Nokha", currentCategory="all";
  const demo=[
    {id:"demo-explore-1",title:"Beautiful Family House",location:"Nokha, Bikaner",propertyType:"house",listingType:"rent",price:"₹12,000 / month",area:"1200 sq ft",bedrooms:"2 BHK",status:"active"},
    {id:"demo-explore-2",title:"Single Room Near Market",location:"Nokha, Bikaner",propertyType:"room",listingType:"rent",price:"₹4,500 / month",area:"350 sq ft",bedrooms:"1 Room",status:"active"},
    {id:"demo-explore-3",title:"Modern 3 BHK Flat",location:"Nokha, Bikaner",propertyType:"flat",listingType:"sell",price:"₹38 Lakh",area:"1450 sq ft",bedrooms:"3 BHK",status:"active"},
    {id:"demo-explore-4",title:"Main Market Shop",location:"Nokha, Bikaner",propertyType:"shop",listingType:"rent",price:"₹15,000 / month",area:"500 sq ft",status:"active"}
  ];
  const icons={all:"⌂",house:"⌂",flat:"▦",room:"▣",plot:"⌗",shop:"▤",commercial:"▥",other:"◇"};
  const labels={all:"All",house:"Home",flat:"Flat",room:"Room",plot:"Plot",shop:"Shop",commercial:"Commercial",other:"Other"};
  function setLocation(v){currentLocation=shortLocation(v);localStorage.setItem("flowLocation",currentLocation);if(selectedLocation)selectedLocation.textContent=currentLocation;render();}
  function renderLocations(items){if(!list)return;list.innerHTML=items.length?items.map(v=>`<button type="button" data-explore-location="${escapeHtml(v)}">📍 ${escapeHtml(v)}</button>`).join(""):`<div class="empty-location"><div>📍</div><p>No location found</p><small>Try another city or area</small></div>`;}
  function buildCategories(){if(!categories)return;categories.innerHTML=Object.keys(labels).map(k=>`<button type="button" class="explore-category ${k===currentCategory?"active":""}" data-explore-category="${k}"><span class="explore-category-icon">${icons[k]}</span>${labels[k]}</button>`).join("");}
  function getProperties(){let user=[];try{user=JSON.parse(localStorage.getItem("flowProperties")||"[]");if(!Array.isArray(user))user=[];}catch{user=[]}return [...demo,...user.filter(p=>p&&p.status!=="sold_out")];}
  function render(){buildCategories();const visible=getProperties().filter(p=>normalize(p.location||"")===normalize(currentLocation)&&(currentCategory==="all"||(p.propertyType||"other")===currentCategory)&&p.status!=="sold_out");grid.innerHTML="";if(title)title.textContent=currentCategory==="all"?`Properties in ${currentLocation}`:`${labels[currentCategory]} in ${currentLocation}`;if(count)count.textContent=`${visible.length} ${visible.length===1?"property":"properties"}`;
    visible.forEach(p=>{const card=document.createElement("article");card.className="property-card";const isDemo=String(p.id).startsWith("demo-explore-");if(!isDemo)card.dataset.id=p.id;const photo=p.photos?.[0]||"",badge=p.listingType==="sell"?"FOR SALE":"FOR RENT",badgeClass=p.listingType==="sell"?"badge sale":"badge",info=p.bedrooms||p.area||labels[p.propertyType]||"Property";card.innerHTML=`<div class="property-photo">${photo?`<img class="property-card-image" src="${escapeHtml(photo)}" alt="${escapeHtml(p.title||"Property")}">`:`<div class="property-card-placeholder">${icons[p.propertyType]||"◇"}</div>`}<span class="${badgeClass}">${badge}</span><button type="button" class="save-btn" aria-label="Save property">♡</button></div><div class="property-details"><h3>${escapeHtml(p.title||"Property")}</h3><p class="property-location">📍 ${escapeHtml(p.location||currentLocation)}</p><div class="property-info-row"><strong>${escapeHtml(String(p.price||"Price on request"))}</strong><span>${escapeHtml(String(info))}</span></div></div>`;
      const save=card.querySelector(".save-btn");if(save&&!isDemo){const saved=isPropertySaved(p.id);save.textContent=saved?"♥":"♡";save.classList.toggle("saved",saved);save.addEventListener("click",e=>{e.preventDefault();e.stopPropagation();const now=toggleSavedProperty(p.id);save.textContent=now?"♥":"♡";save.classList.toggle("saved",now);});}
      if(!isDemo)card.addEventListener("click",e=>{if(e.target.closest(".save-btn"))return;localStorage.setItem("flowSelectedProperty",String(p.id));window.location.href="property-view.html";});grid.appendChild(card);});
    grid.style.display=visible.length?"grid":"none";if(empty)empty.style.display=visible.length?"none":"flex";
  }
  locationBtn?.addEventListener("click",()=>{overlay?.classList.add("show");renderLocations(demoLocations);setTimeout(()=>search?.focus(),50);});
  close?.addEventListener("click",()=>overlay?.classList.remove("show"));overlay?.addEventListener("click",e=>{if(e.target===overlay)overlay.classList.remove("show")});
  search?.addEventListener("input",()=>{const q=search.value.trim().toLowerCase();renderLocations(demoLocations.filter(v=>v.toLowerCase().includes(q)));});
  list?.addEventListener("click",e=>{const b=e.target.closest("[data-explore-location]");if(!b)return;setLocation(b.dataset.exploreLocation||"Nokha");overlay?.classList.remove("show");if(search)search.value="";});
  categories?.addEventListener("click",e=>{const b=e.target.closest("[data-explore-category]");if(!b)return;currentCategory=b.dataset.exploreCategory||"all";render();});
  if(selectedLocation)selectedLocation.textContent=currentLocation;renderLocations(demoLocations);render();
}
/* INITIAL LOAD */

document.addEventListener(
  "DOMContentLoaded",
  function() {

    renderSavedProperties();

  }
);