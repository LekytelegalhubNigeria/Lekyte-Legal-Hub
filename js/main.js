// ===============================
// SUPABASE SETUP (SAFE VERSION)
// ===============================

const SUPABASE_URL = "https://kfsklphutaadklugqxut.supabase.co";

const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtmc2tscGh1dGFhZGtsdWdxeHV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4MTMwMjksImV4cCI6MjA5MzM4OTAyOX0.UXFjp6_ippy4IA_xlfv1q3JtvIHd03wRIpxG-pP1h84";

// WhatsApp must NOT include "+"
const WA_PHONE_NUMBER = "2347025424135";

let supabaseClient = null;

// Initialize Supabase safely
function initSupabase() {
  if (supabaseClient) return;

  if (window.supabase && window.supabase.createClient) {
    supabaseClient = window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY
    );
    console.log("Supabase initialized");
  } else {
    console.warn("Supabase library not loaded yet");
  }
}

initSupabase();

// ===============================
// PAGE NAVIGATION
// ===============================

window.showPage = function (pageId) {
  const pages = document.querySelectorAll(".page");
  pages.forEach((page) => page.classList.remove("active"));

  const selectedPage = document.getElementById(pageId);

  if (!selectedPage) {
    console.warn("Page not found:", pageId);
    return;
  }

  selectedPage.classList.add("active");

  window.scrollTo({ top: 0, behavior: "smooth" });

  const navMenu = document.getElementById("navMenu");
  if (navMenu) navMenu.classList.remove("show");

  if (pageId === "properties") {
    loadProperties();
  }
};

// ===============================
// MOBILE MENU
// ===============================

window.toggleMobileMenu = function () {
  const navMenu = document.getElementById("navMenu");
  if (navMenu) navMenu.classList.toggle("show");
};

// ===============================
// BACK TO TOP BUTTON
// ===============================

const backToTop = document.getElementById("backToTop");

window.addEventListener("scroll", () => {
  if (!backToTop) return;
  backToTop.style.display = window.scrollY > 300 ? "block" : "none";
});

if (backToTop) {
  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// ===============================
// CONTACT FORM (WHATSAPP)
// ===============================

const contactForm = document.getElementById("contactForm");

if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("contactName")?.value.trim();
    const email = document.getElementById("contactEmail")?.value.trim();
    const phone = document.getElementById("contactPhone")?.value.trim();
    const subject = document.getElementById("contactSubject")?.value.trim();
    const message = document.getElementById("contactMessageText")?.value.trim();
    const status = document.getElementById("contactMessage");

    if (!name || !email || !subject || !message) {
      if (status) {
        status.innerHTML = "Please fill all required fields";
        status.style.color = "red";
      }
      return;
    }

    const whatsappMessage = `
Hello Lekyte Legal Hub

Name: ${name}
Email: ${email}
Phone: ${phone || "N/A"}

Subject: ${subject}

Message:
${message}
`;

    window.open(
      `https://wa.me/${WA_PHONE_NUMBER}?text=${encodeURIComponent(
        whatsappMessage
      )}`,
      "_blank"
    );

    if (status) {
      status.innerHTML = "Redirecting to WhatsApp...";
      status.style.color = "green";
    }

    contactForm.reset();
  });
}

// ===============================
// PROPERTY VALUATION
// ===============================

window.calculateValue = function (event) {
  event.preventDefault();

  const type = document.getElementById("propType")?.value;
  const location = document.getElementById("propLocation")?.value;
  const size = parseInt(document.getElementById("propSize")?.value || 0);
  const docs = document.getElementById("propDocs")?.value;

  let basePrice = 10000;

  if (type === "land") basePrice = 15000;
  if (type === "bungalow") basePrice = 45000;
  if (type === "duplex") basePrice = 80000;
  if (type === "flat") basePrice = 50000;
  if (type === "commercial") basePrice = 120000;

  let multiplier = 1;

  if (location === "ajah") multiplier = 2.5;
  if (location === "abuja") multiplier = 3;
  if (location === "akure") multiplier = 1.4;

  let value = basePrice * size * multiplier;

  if (docs === "cofo") value += 5000000;
  if (docs === "deed") value += 1500000;
  if (docs === "survey") value += 700000;

  const result = document.getElementById("valuationResult");

  if (result) {
    result.innerHTML = `
      <div class="valuation-result-box">
        <h3>Estimated Property Value</h3>
        <h2>₦${value.toLocaleString()}</h2>
        <p>This is an estimated market value.</p>
      </div>
    `;
  }
};

// ===============================
// LOAD PROPERTIES
// ===============================

async function loadProperties() {
  if (!supabaseClient) {
    initSupabase();
  }

  if (!supabaseClient) return;

  const grid = document.getElementById("propertiesGrid");
  if (!grid) return;

  grid.innerHTML = `<div class="empty-state"><h3>Loading Properties...</h3></div>`;

  try {
    const { data, error } = await supabaseClient
      .from("properties")
      .select("*")
      .eq("status", "verified")
      .order("created_at", { ascending: false });

    if (error) throw error;

    if (!data || data.length === 0) {
      grid.innerHTML = "";
      return;
    }

    grid.innerHTML = data.map(renderPropertyCard).join("");
  } catch (error) {
    console.error("Error loading properties:", error);
    grid.innerHTML = `<div class="empty-state"><h3>Error loading properties</h3></div>`;
  }
}

// ===============================
// FILTER PROPERTIES
// ===============================

window.filterProperties = async function () {
  if (!supabaseClient) return;

  const type = document.getElementById("propertyType")?.value;
  const location = document.getElementById("propertyLocation")?.value;
  const grid = document.getElementById("propertiesGrid");

  if (!grid) return;

  grid.innerHTML = `<div class="empty-state"><h3>Searching Properties...</h3></div>`;

  try {
    let query = supabaseClient
      .from("properties")
      .select("*")
      .eq("status", "verified");

    if (type && type !== "all") {
      query = query.eq("type", type);
    }

    if (location && location !== "all") {
      query = query.ilike("location", `%${location}%`);
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) throw error;

    if (!data || data.length === 0) {
      grid.innerHTML = "";
      return;
    }

    grid.innerHTML = data.map(renderPropertyCard).join("");
  } catch (error) {
    console.error("Filter error:", error);
    grid.innerHTML = `<div class="empty-state"><h3>Error filtering properties</h3></div>`;
  }
};

// ===============================
// RENDER PROPERTY CARD
// ===============================

function escapeJS(str = "") {
  return String(str).replace(/'/g, "\\'");
}

function renderPropertyCard(property) {
  const phone = property.whatsapp || WA_PHONE_NUMBER;
  const images = property.images || [property.image_url || "images/property1.jpg"];
  const video = property.video_url || null;

  // Build image gallery HTML
  const galleryHTML = images.map((img, index) => `
    <img src="${img}" alt="${property.title} ${index + 1}"
         loading="lazy"
         class="${index === 0? 'active' : ''}"
         onclick="changePropertyImage(this)">
  `).join('');

  return `
    <div class="property-card">
      <div class="property-card-header">
        <img src="images/agent1.jpg" alt="Agent" loading="lazy">
        <div class="meta">
          <h4>${property.agent_name || 'Lekyte Legal Hub'}</h4>
          <span>Verified • ${property.location || 'Nigeria'}</span>
        </div>
      </div>

      <div class="property-card-media">
        ${video? `
          <video controls preload="metadata" poster="${images[0]}" class="property-video">
            <source src="${video}" type="video/mp4">
            Your browser does not support video.
          </video>
        ` : ''}

        <div class="property-gallery">
          <div class="gallery-main">
            <img src="${images[0]}" alt="${property.title}" id="mainImg-${property.id}">
          </div>
          <div class="gallery-thumbs">
            ${galleryHTML}
          </div>
        </div>
      </div>

      <div class="property-card-body">
        <div class="price">₦${Number(property.price || 0).toLocaleString()}</div>
        <h4>${property.title || 'Property'}</h4>
        <p>${property.description || ''}</p>
        <div class="property-meta">
          <span><i class="fas fa-bed"></i> ${property.bedrooms || 0} Beds</span>
          <span><i class="fas fa-bath"></i> ${property.bathrooms || 0} Baths</span>
          <span><i class="fas fa-ruler-combined"></i> ${property.size || 0} sqm</span>
        </div>
      </div>

      <div class="property-card-actions">
        <button onclick="window.open('https://wa.me/${phone}?text=Hello, I am interested in ${encodeURIComponent(property.title)}')">
          <i class="fas fa-phone"></i> Contact
        </button>

        <button onclick="shareProperty('${property.id}')">
          <i class="fas fa-share"></i> Share
        </button>

        <button>
          <i class="fas fa-shield-alt"></i> Verified
        </button>
      </div>
    </div>
  `;
}

// Switch gallery image when thumbnail is clicked
window.changePropertyImage = function(thumb) {
  const gallery = thumb.closest('.property-gallery');
  const mainImg = gallery.querySelector('.gallery-main img');
  mainImg.src = thumb.src;

  gallery.querySelectorAll('.gallery-thumbs img').forEach(img => img.classList.remove('active'));
  thumb.classList.add('active');
}

// ===============================
// SHARE PROPERTY (FIXED)
// ===============================

window.shareProperty = function (id = "") {
  const url = id
    ? `${window.location.origin}/properties?id=${id}`
    : window.location.href;

  const text = "Check this verified property on Lekyte Legal Hub";

  if (navigator.share) {
    navigator.share({
      title: text,
      url: url,
    });
  } else {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`
    );
  }
};

// ===============================
// AGENT LOGOUT
// ===============================

window.agentLogout = async function () {
  try {
    if (supabaseClient) {
      await supabaseClient.auth.signOut();
    }

    alert("Logged out successfully");
    showPage("home");
  } catch (error) {
    console.error("Logout error:", error);
  }
};

// ===============================
// INIT CHECK
// ===============================

document.addEventListener("DOMContentLoaded", async () => {
  initSupabase();

  try {
    if (supabaseClient) {
      const { data } = await supabaseClient.auth.getSession();
      console.log("Supabase Ready", data?.session ? "Logged in" : "Guest");
    }
  } catch (error) {
    console.error("Init error:", error);
  }
});