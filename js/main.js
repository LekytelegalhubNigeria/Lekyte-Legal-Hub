// ===============================
// SUPABASE SETUP (FIXED & SAFE)
// ===============================

const SUPABASE_URL = "https://kfsklphutaadklugqxut.supabase.co";

const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtmc2tscGh1dGFhZGtsdWdxeHV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4MTMwMjksImV4cCI6MjA5MzM4OTAyOX0.UXFjp6_ippy4IA_xlfv1q3JtvIHd03wRIpxG-pP1h84";

const WA_PHONE_NUMBER = "2347025424135";

// Safe Supabase client (prevents "already declared" error)
let supabaseClient = null;

if (window.supabase && !window._supabase_initialized) {
  supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  );
  window._supabase_initialized = true;
} else {
  console.warn("Supabase not initialized or already exists");
}

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
};

// ===============================
// MOBILE MENU FIX (MATCH YOUR HTML)
// ===============================

window.toggleMobileMenu = function () {
  const navMenu = document.getElementById("navMenu");

  if (navMenu) {
    navMenu.classList.toggle("show"); // FIXED (was "active")
  }
};

// ===============================
// BACK TO TOP BUTTON
// ===============================

const backToTop = document.getElementById("backToTop");

window.addEventListener("scroll", () => {
  if (!backToTop) return;

  if (window.scrollY > 300) {
    backToTop.style.display = "block";
  } else {
    backToTop.style.display = "none";
  }
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
Phone: ${phone}

Subject:
${subject}

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

  const type = document.getElementById("propType").value;
  const location = document.getElementById("propLocation").value;
  const size = parseInt(document.getElementById("propSize").value || 0);
  const docs = document.getElementById("propDocs").value;

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
// FILTER PROPERTIES
// ===============================

window.filterProperties = function () {
  const type = document.getElementById("propertyType")?.value;
  const location = document.getElementById("propertyLocation")?.value;

  const grid = document.getElementById("propertiesGrid");

  if (!grid) return;

  grid.innerHTML = `
    <div class="empty-state">
      <h3>Searching Properties...</h3>
      <p>Type: ${type} | Location: ${location}</p>
    </div>
  `;
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
  try {
    if (supabaseClient) {
      const { data: { session } } = await supabaseClient.auth.getSession();

      console.log("Supabase Ready");

      if (session) {
        console.log("User logged in");
      }
    }
  } catch (error) {
    console.error("Init error:", error);
  }
}); 